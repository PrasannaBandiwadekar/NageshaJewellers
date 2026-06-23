using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.DTOs;
using NageshaJewellers.API.Models;

namespace NageshaJewellers.API.Controllers
{
    // Base URL: /api/products
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
        // Anyone can call this - no login needed. Used for the shop/listing page.
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
                .Select(p => MapToDto(p))
                .ToListAsync();

            return Ok(products);
        }

        // GET /api/products/pearl-medallion-necklace
        // Returns one product by its URL-friendly slug, for the product detail page
        [HttpGet("{slug}")]
        public async Task<ActionResult<ProductDto>> GetProductBySlug(string slug)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

            if (product == null)
                return NotFound(new { message = "Product not found." });

            return Ok(MapToDto(product));
        }

        // ===========================================================
        // EVERYTHING BELOW THIS LINE IS FOR ADMIN ONLY
        // [Authorize(Roles = "Admin")] means: you must be logged in
        // AND your account's Role must be "Admin", or you get rejected.
        // ===========================================================

        // POST /api/products  (create a new product)
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
                Price = dto.Price,
                CompareAtPrice = dto.CompareAtPrice,
                StockQuantity = dto.StockQuantity,
                SKU = dto.SKU,
                CategoryId = dto.CategoryId,
                IsFeatured = dto.IsFeatured,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            for (int i = 0; i < dto.Images.Count; i++)
            {
                product.Images.Add(new ProductImage { ImageUrl = dto.Images[i], DisplayOrder = i });
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            return Ok(MapToDto(product));
        }

        // PUT /api/products/5  (edit an existing product)
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
            product.Price = dto.Price;
            product.CompareAtPrice = dto.CompareAtPrice;
            product.StockQuantity = dto.StockQuantity;
            product.SKU = dto.SKU;
            product.CategoryId = dto.CategoryId;
            product.IsFeatured = dto.IsFeatured;
            product.IsActive = dto.IsActive;
            product.UpdatedAt = DateTime.UtcNow;

            // Replace images with the new list sent from the admin form
            _context.ProductImages.RemoveRange(product.Images);
            product.Images.Clear();
            for (int i = 0; i < dto.Images.Count; i++)
            {
                product.Images.Add(new ProductImage { ImageUrl = dto.Images[i], DisplayOrder = i });
            }

            await _context.SaveChangesAsync();
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            return Ok(MapToDto(product));
        }

        // DELETE /api/products/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found." });

            // We don't actually delete it from the database (that could break
            // old orders that reference it). We just hide it from shoppers.
            product.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product removed." });
        }

        // ---------- Helper methods (not API endpoints, just reused code) ----------

        private static ProductDto MapToDto(Product p)
        {
            return new ProductDto
            {
                ProductId = p.ProductId,
                Name = p.Name,
                Slug = p.Slug,
                Description = p.Description,
                Material = p.Material,
                Price = p.Price,
                CompareAtPrice = p.CompareAtPrice,
                StockQuantity = p.StockQuantity,
                IsFeatured = p.IsFeatured,
                CategoryName = p.Category?.Name ?? "",
                CategorySlug = p.Category?.Slug ?? "",
                Images = p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).ToList()
            };
        }

        // Turns "Pearl Medallion Necklace" into "pearl-medallion-necklace-4821"
        // (the random number at the end avoids clashes if two products have the same name)
        private string GenerateSlug(string name)
        {
            var basicSlug = name.ToLower().Trim()
                .Replace(" ", "-")
                .Replace("'", "");
            var random = new Random().Next(1000, 9999);
            return $"{basicSlug}-{random}";
        }
    }
}
