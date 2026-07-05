namespace NageshaJewellers.API.DTOs
{
    // Sent FROM the API TO React, when showing a product to shoppers
    public class ProductDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Material { get; set; }
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int StockQuantity { get; set; }
        public bool IsFeatured { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategorySlug { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new();
        public string? MetalType { get; set; }
        public decimal? WeightInGrams { get; set; }
        public decimal? MakingChargePercent { get; set; }
    }

    // Sent FROM React TO the API, when admin creates or edits a product
    public class ProductCreateUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Material { get; set; }
        public decimal? Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int StockQuantity { get; set; }
        public string? SKU { get; set; }
        public string? MetalType { get; set; }
        public decimal? WeightInGrams { get; set; }
        public decimal? MakingChargePercent { get; set; }
        public int CategoryId { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; } = true;
        public List<string> Images { get; set; } = new();
    }

    public class CategoryDto
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }

    public class AdminCategoryDto
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class CategoryCreateUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}