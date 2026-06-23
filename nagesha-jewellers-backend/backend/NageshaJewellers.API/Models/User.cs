namespace NageshaJewellers.API.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // We NEVER store the real password. We store a "hash" - a scrambled,
        // one-way version. Even if someone stole the database, they couldn't
        // read the original passwords.
        public string PasswordHash { get; set; } = string.Empty;

        public string? Phone { get; set; }

        // "Customer" or "Admin" - decides whether someone can access /admin pages
        public string Role { get; set; } = "Customer";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Address> Addresses { get; set; } = new();
        public List<Order> Orders { get; set; } = new();
        public List<CartItem> CartItems { get; set; } = new();
    }
}
