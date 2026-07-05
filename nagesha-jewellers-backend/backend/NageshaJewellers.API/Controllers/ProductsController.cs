using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.DTOs;
using NageshaJewellers.API.Models;

namespace NageshaJewellers.API.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/products
        // GET /api/products?categorySlug=earrings
        // GET /api/products?featured=true
        [HttpGet]
        public async Task<ActionResult<List<ProductDto>>> GetProducts(
            [FromQuery] string? categorySlug,
            [FromQuery] bool? featured)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(categorySlug))
                query = query.Where(p => p.Category!.Slug == categorySlug);

            if (featured == true)
                query = query.Where(p => p.IsFeatured);

            var products = await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var rates = await GetCurrentRatesAsync();
            var result = products.Select(p => MapToDto(p, rates)).ToList();
            return Ok(result);
        }

        // GET /api/products/some-slug
        [HttpGet("{slug}")]
        public async Task<ActionResult<ProductDto>> GetProductBySlug(string slug)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

            if (product == null)
                return NotFound(new { message = "Product not found." });

            var rates = await GetCurrentRatesAsync();
            return Ok(MapToDto(product, rates));
        }

        // POST /api/products
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> CreateProduct(ProductCreateUpdateDto dto)
        {
            var slug = GenerateSlug(dto.Name);

            var product = new Product
            {
                Name = dto.Name,
                Slug = slug,
                Description = dto.Description,
                Material = dto.Material,
                Price = dto.Price ?? 0,
                CompareAtPrice = dto.CompareAtPrice,
                StockQuantity = dto.StockQuantity,
                SKU = dto.SKU,
                CategoryId = dto.CategoryId,
                IsFeatured = dto.IsFeatured,
                IsActive = dto.IsActive,
                MetalType = dto.MetalType,
                WeightInGrams = dto.WeightInGrams,
                MakingChargePercent = dto.MakingChargePercent,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            for (int i = 0; i < dto.Images.Count; i++)
                product.Images.Add(new ProductImage { ImageUrl = dto.Images[i], DisplayOrder = i });

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            var rates = await GetCurrentRatesAsync();
            return Ok(MapToDto(product, rates));
        }

        // PUT /api/products/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, ProductCreateUpdateDto dto)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
                return NotFound(new { message = "Product not found." });

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Material = dto.Material;
            product.Price = dto.Price ?? 0;
            product.CompareAtPrice = dto.CompareAtPrice;
            product.StockQuantity = dto.StockQuantity;
            product.SKU = dto.SKU;
            product.CategoryId = dto.CategoryId;
            product.IsFeatured = dto.IsFeatured;
            product.IsActive = dto.IsActive;
            product.MetalType = dto.MetalType;
            product.WeightInGrams = dto.WeightInGrams;
            product.MakingChargePercent = dto.MakingChargePercent;
            product.UpdatedAt = DateTime.UtcNow;

            // Mark every property as modified so EF Core definitely saves them all.
            // This is the key fix - without this, EF Core sometimes skips columns
            // that were added via ALTER TABLE instead of EF migrations.
            _context.Entry(product).State = EntityState.Modified;

            // Replace images
            _context.ProductImages.RemoveRange(product.Images);
            product.Images.Clear();
            for (int i = 0; i < dto.Images.Count; i++)
                product.Images.Add(new ProductImage { ImageUrl = dto.Images[i], DisplayOrder = i });

            await _context.SaveChangesAsync();
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            var rates = await GetCurrentRatesAsync();
            return Ok(MapToDto(product, rates));
        }

        // DELETE /api/products/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found." });

            product.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product removed." });
        }

        // ---------- Helpers ----------

        // Fetch all rates once per request - efficient and avoids
        // repeated DB calls when mapping a list of products
        private async Task<Dictionary<string, decimal>> GetCurrentRatesAsync()
        {
            var rates = await _context.MetalRates.ToListAsync();
            return rates.ToDictionary(r => r.MetalType, r => r.RatePerGram);
        }

        private static ProductDto MapToDto(Product p, Dictionary<string, decimal> rates)
        {
            var price = p.Price;
            decimal? compareAt = p.CompareAtPrice;

            // Calculate live price if this product has metal type and weight
            if (!string.IsNullOrEmpty(p.MetalType)
                && p.WeightInGrams.HasValue
                && p.WeightInGrams > 0
                && rates.TryGetValue(p.MetalType, out var liveRate))
            {
                var metalCost = p.WeightInGrams.Value * liveRate;
                var makingCharge = metalCost * ((p.MakingChargePercent ?? 0) / 100m);
                price = Math.Round(metalCost + makingCharge, 2);
                compareAt = null;
            }

            return new ProductDto
            {
                ProductId = p.ProductId,
                Name = p.Name,
                Slug = p.Slug,
                Description = p.Description,
                Material = p.Material,
                Price = price,
                CompareAtPrice = compareAt.HasValue ? Math.Round(compareAt.Value, 2) : null,
                StockQuantity = p.StockQuantity,
                IsFeatured = p.IsFeatured,
                CategoryName = p.Category?.Name ?? "",
                CategorySlug = p.Category?.Slug ?? "",
                Images = p.Images.OrderBy(i => i.DisplayOrder)
                                 .Select(i => i.ImageUrl).ToList(),
                MetalType = p.MetalType,
                WeightInGrams = p.WeightInGrams,
                MakingChargePercent = p.MakingChargePercent
            };
        }

        private static string GenerateSlug(string name)
        {
            var basicSlug = name.ToLower().Trim()
                .Replace(" ", "-")
                .Replace("'", "");
            var random = new Random().Next(1000, 9999);
            return $"{basicSlug}-{random}";
        }
    }
}