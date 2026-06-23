namespace NageshaJewellers.API.Models
{
    public class OrderItem
    {
        public int OrderItemId { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }

        // We COPY the product name and price at the moment of ordering.
        // Why? Because if you later change the product's price, old orders
        // should still show what the customer actually paid back then.
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }

        public Order? Order { get; set; }
        public Product? Product { get; set; }
    }
}
