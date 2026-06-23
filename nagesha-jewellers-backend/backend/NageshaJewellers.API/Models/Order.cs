namespace NageshaJewellers.API.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }

        // Pending -> Paid -> Shipped -> Delivered (or Cancelled at any point)
        public string Status { get; set; } = "Pending";

        public string ShippingFullName { get; set; } = string.Empty;
        public string ShippingPhone { get; set; } = string.Empty;
        public string ShippingLine1 { get; set; } = string.Empty;
        public string? ShippingLine2 { get; set; }
        public string ShippingCity { get; set; } = string.Empty;
        public string ShippingState { get; set; } = string.Empty;
        public string ShippingPostalCode { get; set; } = string.Empty;

        // These two come from Razorpay (the payment gateway) once payment happens
        public string? RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string PaymentStatus { get; set; } = "Unpaid"; // Unpaid, Paid, Failed

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public List<OrderItem> Items { get; set; } = new();
    }
}
