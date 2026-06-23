using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.DTOs;
using NageshaJewellers.API.Models;

namespace NageshaJewellers.API.Controllers
{
    // A "Controller" is a group of related API endpoints (URLs).
    // This one handles anything to do with Categories (Earrings, Necklaces, etc.)
    // Base URL for everything here: /api/categories
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/categories
        // Returns the list of active categories, for the navigation menu
        [HttpGet]
        public async Task<ActionResult<List<CategoryDto>>> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new CategoryDto
                {
                    CategoryId = c.CategoryId,
                    Name = c.Name,
                    Slug = c.Slug,
                    ImageUrl = c.ImageUrl
                })
                .ToListAsync();

            return Ok(categories);
        }

        // ===========================================================
        // EVERYTHING BELOW THIS LINE IS FOR ADMIN ONLY
        // ===========================================================

        // GET /api/categories/admin
        // Returns EVERY category (including hidden ones), for the Admin panel
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<AdminCategoryDto>>> GetAllCategoriesAdmin()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new AdminCategoryDto
                {
                    CategoryId = c.CategoryId,
                    Name = c.Name,
                    Slug = c.Slug,
                    ImageUrl = c.ImageUrl,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive
                })
                .ToListAsync();

            return Ok(categories);
        }

        // POST /api/categories  (create a new category)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AdminCategoryDto>> CreateCategory(CategoryCreateUpdateDto dto)
        {
            var slug = GenerateSlug(dto.Name);

            var category = new Category
            {
                Name = dto.Name,
                Slug = slug,
                ImageUrl = dto.ImageUrl,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new AdminCategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Slug = category.Slug,
                ImageUrl = category.ImageUrl,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive
            });
        }

        // PUT /api/categories/3  (edit an existing category - this is how you change its photo)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AdminCategoryDto>> UpdateCategory(int id, CategoryCreateUpdateDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found." });

            category.Name = dto.Name;
            category.ImageUrl = dto.ImageUrl;
            category.DisplayOrder = dto.DisplayOrder;
            category.IsActive = dto.IsActive;
            // Note: we deliberately do NOT change the Slug on edit - changing
            // it could break existing links people may have bookmarked/shared
            // to "/shop/<slug>".

            await _context.SaveChangesAsync();

            return Ok(new AdminCategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Slug = category.Slug,
                ImageUrl = category.ImageUrl,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive
            });
        }

        // DELETE /api/categories/3
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found." });

            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                // We don't allow deleting a category that still has products
                // in it - that would leave those products "orphaned". Instead,
                // we just hide it from shoppers (same approach as products).
                category.IsActive = false;
                await _context.SaveChangesAsync();
                return Ok(new { message = "This category still has products in it, so it was hidden instead of deleted. Move or remove its products first if you want to fully delete it." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Category deleted." });
        }

        // Turns "Anklets" into "anklets" (matches the same pattern used for products)
        private string GenerateSlug(string name)
        {
            return name.ToLower().Trim().Replace(" ", "-").Replace("'", "");
        }
    }
}
