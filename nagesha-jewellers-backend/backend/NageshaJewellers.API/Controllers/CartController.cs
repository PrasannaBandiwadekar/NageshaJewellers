using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.DTOs;
using NageshaJewellers.API.Models;
using NageshaJewellers.API.Services;

namespace NageshaJewellers.API.Controllers
{
    // Base URL: /api/cart
    // [Authorize] on the whole controller means: every endpoint here
    // requires the customer to be logged in (must send a valid token).
    [ApiController]
    [Route("api/cart")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/cart
        // Returns everything currently in the logged-in user's basket
        [HttpGet]
        public async Task<ActionResult<List<CartItemDto>>> GetCart()
        {
            var userId = User.GetUserId();

            var items = await _context.CartItems
                .Include(c => c.Product).ThenInclude(p => p!.Images)
                .Where(c => c.UserId == userId)
                .Select(c => new CartItemDto
                {
                    CartItemId = c.CartItemId,
                    ProductId = c.ProductId,
                    ProductName = c.Product!.Name,
                    ImageUrl = c.Product.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                    Price = c.Product.Price,
                    Quantity = c.Quantity,
                    LineTotal = c.Product.Price * c.Quantity
                })
                .ToListAsync();

            return Ok(items);
        }

        // POST /api/cart
        // Adds a product to the basket (or increases quantity if already there)
        [HttpPost]
        public async Task<IActionResult> AddToCart(AddToCartDto dto)
        {
            var userId = User.GetUserId();

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null || !product.IsActive)
                return NotFound(new { message = "Product not found." });

            var existing = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId);

            if (existing != null)
            {
                existing.Quantity += dto.Quantity;
            }
            else
            {
                _context.CartItems.Add(new CartItem
                {
                    UserId = userId,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Added to cart." });
        }

        // PUT /api/cart/5   (cart item id = 5)
        // Changes the quantity of one item already in the basket
        [HttpPut("{cartItemId}")]
        public async Task<IActionResult> UpdateQuantity(int cartItemId, UpdateCartItemDto dto)
        {
            var userId = User.GetUserId();

            var item = await _context.CartItems
                .FirstOrDefaultAsync(c => c.CartItemId == cartItemId && c.UserId == userId);

            if (item == null)
                return NotFound(new { message = "Cart item not found." });

            if (dto.Quantity <= 0)
                _context.CartItems.Remove(item);
            else
                item.Quantity = dto.Quantity;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart updated." });
        }

        // DELETE /api/cart/5
        [HttpDelete("{cartItemId}")]
        public async Task<IActionResult> RemoveItem(int cartItemId)
        {
            var userId = User.GetUserId();

            var item = await _context.CartItems
                .FirstOrDefaultAsync(c => c.CartItemId == cartItemId && c.UserId == userId);

            if (item == null)
                return NotFound(new { message = "Cart item not found." });

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Removed from cart." });
        }
    }
}
