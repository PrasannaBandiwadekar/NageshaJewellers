using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Data;
using NageshaJewellers.API.DTOs;

namespace NageshaJewellers.API.Controllers
{
    // Base URL: /api/admin
    // Everything here requires Role = Admin (set up in CreatesAdminUser below
    // and explained in the setup guide)
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/admin/orders
        // Shows every order from every customer - for the admin dashboard
        [HttpGet("orders")]
        public async Task<ActionResult<List<OrderDto>>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
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

        // PUT /api/admin/orders/12/status?status=Shipped
        // Lets the shop owner update an order's status as it progresses
        [HttpPut("orders/{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromQuery] string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound(new { message = "Order not found." });

            var allowedStatuses = new[] { "Pending", "Paid", "Shipped", "Delivered", "Cancelled" };
            if (!allowedStatuses.Contains(status))
                return BadRequest(new { message = "Invalid status value." });

            order.Status = status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated." });
        }
    }
}
