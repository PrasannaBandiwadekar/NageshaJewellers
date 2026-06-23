using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.DTOs;
using NageshaJewellers.API.Models;
using NageshaJewellers.API.Services;

namespace NageshaJewellers.API.Controllers
{
    // Base URL: /api/orders
    [ApiController]
    [Route("api/orders")]
    [Authorize] // must be logged in for everything here
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public OrdersController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // POST /api/orders/checkout
        // PAY ON DELIVERY VERSION: customer has filled in their shipping
        // address. We create the Order immediately with status "Pending"
        // and PaymentStatus "Pay on Delivery" - there is no payment gateway
        // step right now. The shop owner collects payment in person/COD,
        // then updates the order status from the Admin panel as it
        // progresses (Pending -> Shipped -> Delivered).
        //
        // NOTE FOR LATER: when online payment is added back, this is the
        // method to restore the Razorpay order-creation call in (see the
        // version of this file from before this change, or ask Claude).
        [HttpPost("checkout")]
        public async Task<ActionResult<CreateOrderResponseDto>> Checkout(CheckoutDto dto)
        {
            var userId = User.GetUserId();

            var cartItems = await _context.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
                return BadRequest(new { message = "Your cart is empty." });

            var total = cartItems.Sum(c => c.Product!.Price * c.Quantity);
            var orderNumber = $"NJ-{DateTime.UtcNow:yyMMdd}-{new Random().Next(1000, 9999)}";

            var order = new Order
            {
                UserId = userId,
                OrderNumber = orderNumber,
                TotalAmount = total,
                Status = "Pending",
                PaymentStatus = "Pay on Delivery",
                ShippingFullName = dto.ShippingFullName,
                ShippingPhone = dto.ShippingPhone,
                ShippingLine1 = dto.ShippingLine1,
                ShippingLine2 = dto.ShippingLine2,
                ShippingCity = dto.ShippingCity,
                ShippingState = dto.ShippingState,
                ShippingPostalCode = dto.ShippingPostalCode
            };

            foreach (var item in cartItems)
            {
                order.Items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductName = item.Product!.Name,
                    UnitPrice = item.Product.Price,
                    Quantity = item.Quantity
                });
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync(); // this fills in order.OrderId

            // Empty the cart now that it's become an order
            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            // Send the order confirmation email. We look up the user's
            // name/email separately since the Order itself only stores
            // shipping details, not the account's registered email.
            // Same "fire and forget" approach as the welcome email -
            // placing the order should feel instant even if the email
            // takes a moment to send, and a failed email should never
            // undo a successfully placed order.
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                var confirmationDetails = new OrderConfirmationDetails
                {
                    OrderNumber = order.OrderNumber,
                    TotalAmount = order.TotalAmount,
                    ShippingFullName = order.ShippingFullName,
                    ShippingPhone = order.ShippingPhone,
                    ShippingLine1 = order.ShippingLine1,
                    ShippingLine2 = order.ShippingLine2,
                    ShippingCity = order.ShippingCity,
                    ShippingState = order.ShippingState,
                    ShippingPostalCode = order.ShippingPostalCode,
                    Items = order.Items.Select(i => new OrderConfirmationItem
                    {
                        ProductName = i.ProductName,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity
                    }).ToList()
                };

                _ = _emailService.SendOrderConfirmationEmailAsync(user.Email, user.FullName, confirmationDetails);
            }

            // No Razorpay fields needed - React just needs the order number
            // to show the confirmation page.
            return Ok(new CreateOrderResponseDto
            {
                OrderId = order.OrderId,
                OrderNumber = order.OrderNumber,
                RazorpayOrderId = "",
                AmountInRupees = total,
                RazorpayKeyId = ""
            });
        }

        // NOTE: the old POST /api/orders/verify-payment endpoint (Razorpay
        // signature verification) has been removed for now, since orders
        // are Pay on Delivery and there's no online payment to verify.
        // If online payment is reintroduced later, this is where that
        // endpoint should be added back.

        // GET /api/orders
        // Order history for the logged-in customer ("My Orders" page)
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
        {
            var userId = User.GetUserId();

            var orders = await _context.Orders
                .Include(o => o.Items)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    OrderNumber = o.OrderNumber,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    PaymentStatus = o.PaymentStatus,
                    CreatedAt = o.CreatedAt,
                    Items = o.Items.Select(i => new OrderItemDto
                    {
                        ProductName = i.ProductName,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }
    }
}
