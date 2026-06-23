namespace NageshaJewellers.API.Models
{
    // This class is the C# "shape" of one row in the Categories table.
    // Entity Framework uses this to read/write that table automatically.
    public class Category
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // This lets us write category.Products to get all products in this category
        public List<Product> Products { get; set; } = new();
    }
}
