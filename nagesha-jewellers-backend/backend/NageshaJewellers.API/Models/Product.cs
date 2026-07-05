namespace NageshaJewellers.API.Models
{
    public class Product
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Material { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; } // original price, for showing a sale strike-through
        public int StockQuantity { get; set; }
        public string? SKU { get; set; }
        public int CategoryId { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties - let C# code "walk" from a product to its
        // category, or to its list of photos, without writing extra SQL.
        public Category? Category { get; set; }
        public List<ProductImage> Images { get; set; } = new();
        public string? MetalType { get; set; }
        public decimal? WeightInGrams { get; set; }
        public decimal? MakingChargePercent { get; set; }
    }
}
