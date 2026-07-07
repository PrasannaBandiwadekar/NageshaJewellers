namespace NageshaJewellers.API.DTOs
{
    // Sent FROM the API TO React when listing reviews for a product
    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Body { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Sent FROM React TO the API when a customer submits a review
    public class CreateReviewDto
    {
        public int Rating { get; set; }       // 1-5, required
        public string? Title { get; set; }    // optional short heading
        public string? Body { get; set; }     // optional written text
    }

    // Summary stats shown at the top of the reviews section
    // e.g. "4.3 stars · 12 reviews"
    public class ReviewSummaryDto
    {
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public List<ReviewDto> Reviews { get; set; } = new();
        // How many reviews gave each star count (for the rating bar chart)
        public Dictionary<int, int> RatingBreakdown { get; set; } = new();
    }
}
