using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Models;

namespace NageshaJewellers.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<MetalRate> MetalRates => Set<MetalRate>();
        public DbSet<Review> Reviews => Set<Review>();  // ← new

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Unique indexes
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Category>().HasIndex(c => c.Slug).IsUnique();
            modelBuilder.Entity<Product>().HasIndex(p => p.Slug).IsUnique();
            modelBuilder.Entity<Order>().HasIndex(o => o.OrderNumber).IsUnique();

            // One review per user per product
            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.UserId, r.ProductId })
                .IsUnique();

            // Rating must be 1-5
            modelBuilder.Entity<Review>()
                .HasCheckConstraint("CHK_Reviews_Rating", "[Rating] >= 1 AND [Rating] <= 5");

            // Decimal precision
            modelBuilder.Entity<Product>().Property(p => p.Price).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Product>().Property(p => p.CompareAtPrice).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Product>().Property(p => p.WeightInGrams).HasColumnType("decimal(8,3)");
            modelBuilder.Entity<Product>().Property(p => p.MakingChargePercent).HasColumnType("decimal(5,2)");
            modelBuilder.Entity<Order>().Property(o => o.TotalAmount).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<MetalRate>().Property(m => m.RatePerGram).HasColumnType("decimal(12,2)");

            base.OnModelCreating(modelBuilder);
        }
    }
}
