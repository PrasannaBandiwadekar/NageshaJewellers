namespace NageshaJewellers.API.Models
{
    // One row = one customer's review on one product.
    public class Review
    {
        public int ReviewId { get; set; }
        public int ProductId { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public int Rating { get; set; }          // 1-5
        public string? Title { get; set; }
        public string? Body { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Product? Product { get; set; }
        public User? User { get; set; }
    }
}
