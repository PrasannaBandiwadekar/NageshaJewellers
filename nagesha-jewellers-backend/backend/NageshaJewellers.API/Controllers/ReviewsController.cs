using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.DTOs;
using NageshaJewellers.API.Models;
using NageshaJewellers.API.Services;

namespace NageshaJewellers.API.Controllers
{
    // Base URL: /api/reviews
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/reviews/{productId}
        // Public - anyone can read reviews for a product.
        // Returns the full summary: average rating, breakdown, and all reviews.
        [HttpGet("{productId}")]
        public async Task<ActionResult<ReviewSummaryDto>> GetProductReviews(int productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            // Build the rating breakdown (how many 1-star, 2-star... reviews)
            var breakdown = new Dictionary<int, int>
            {
                { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 }
            };
            foreach (var r in reviews)
                breakdown[r.Rating]++;

            var summary = new ReviewSummaryDto
            {
                TotalReviews = reviews.Count,
                AverageRating = reviews.Count > 0
                    ? Math.Round(reviews.Average(r => r.Rating), 1)
                    : 0,
                RatingBreakdown = breakdown,
                Reviews = reviews.Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    UserFullName = r.UserFullName,
                    Rating = r.Rating,
                    Title = r.Title,
                    Body = r.Body,
                    CreatedAt = r.CreatedAt
                }).ToList()
            };

            return Ok(summary);
        }

        // GET /api/reviews/{productId}/my-review
        // Logged-in customers call this to check if they've already reviewed
        // this product (so the frontend can show "Edit your review" instead
        // of "Write a review").
        [HttpGet("{productId}/my-review")]
        [Authorize]
        public async Task<ActionResult<ReviewDto?>> GetMyReview(int productId)
        {
            var userId = User.GetUserId();

            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ProductId == productId && r.UserId == userId);

            if (review == null)
                return Ok(null);

            return Ok(new ReviewDto
            {
                ReviewId = review.ReviewId,
                UserFullName = review.UserFullName,
                Rating = review.Rating,
                Title = review.Title,
                Body = review.Body,
                CreatedAt = review.CreatedAt
            });
        }

        // POST /api/reviews/{productId}
        // Logged-in customer submits a new review.
        // We verify they actually bought this product before allowing it.
        [HttpPost("{productId}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> CreateReview(int productId, CreateReviewDto dto)
        {
            var userId = User.GetUserId();

            // Validate rating range
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new { message = "Rating must be between 1 and 5." });

            // Check the product exists
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return NotFound(new { message = "Product not found." });

            // Check they haven't already reviewed this product
            var existingReview = await _context.Reviews
                .AnyAsync(r => r.ProductId == productId && r.UserId == userId);
            if (existingReview)
                return BadRequest(new { message = "You have already reviewed this product." });

            // Check they actually purchased this product
            // (so only real buyers can leave reviews - prevents fake reviews)
            var hasPurchased = await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.ProductId == productId
                             && oi.Order!.UserId == userId
                             && oi.Order.PaymentStatus == "Pay on Delivery");

            if (!hasPurchased)
                return BadRequest(new
                {
                    message = "You can only review products you have purchased."
                });

            // Get the user's current name to snapshot it on the review
            var user = await _context.Users.FindAsync(userId);

            var review = new Review
            {
                ProductId = productId,
                UserId = userId,
                UserFullName = user!.FullName,
                Rating = dto.Rating,
                Title = dto.Title?.Trim(),
                Body = dto.Body?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new ReviewDto
            {
                ReviewId = review.ReviewId,
                UserFullName = review.UserFullName,
                Rating = review.Rating,
                Title = review.Title,
                Body = review.Body,
                CreatedAt = review.CreatedAt
            });
        }

        // DELETE /api/reviews/{reviewId}
        // Admin can remove any review. Customer can only remove their own.
        [HttpDelete("{reviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            var userId = User.GetUserId();
            var isAdmin = User.IsInRole("Admin");

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                return NotFound(new { message = "Review not found." });

            if (!isAdmin && review.UserId != userId)
                return Forbid();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review removed." });
        }
    }
}
