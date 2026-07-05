using Microsoft.EntityFrameworkCore;
using NageshaJewellers.API.Models;

namespace NageshaJewellers.API.Data
{
    // AppDbContext is the "translator" between your C# code and SQL Server.
    // When you write `_context.Products.Add(newProduct)`, this class is what
    // turns that into the actual SQL needed to insert a row into the
    // Products table.
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Each of these represents one table in the database
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<MetalRate> MetalRates => Set<MetalRate>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Make sure Email and Slug values can't be duplicated
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Category>()
                .HasIndex(c => c.Slug)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderNumber)
                .IsUnique();

            // Set decimal precision so money values store correctly (no rounding surprises)
            modelBuilder.Entity<Product>().Property(p => p.Price).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Product>().Property(p => p.CompareAtPrice).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<Order>().Property(o => o.TotalAmount).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<MetalRate>().Property(m => m.RatePerGram).HasColumnType("decimal(12,2)");
            modelBuilder.Entity<Product>().Property(p => p.WeightInGrams).HasColumnType("decimal(8,3)");
            modelBuilder.Entity<Product>().Property(p => p.MakingChargePercent).HasColumnType("decimal(5,2)");

            base.OnModelCreating(modelBuilder);
        }
    }
}
