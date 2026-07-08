# Nagesha Jewellers — Full-Stack E-Commerce Platform

A complete, production-ready e-commerce web application for an online jewellery store, built from scratch with React, ASP.NET Core Web API, and SQL Server.

---

## Live Features

### Customer-Facing
- Browse jewellery by category (Earrings, Necklaces, Bracelets, Rings)
- Dynamic product catalogue with category filtering and sort options
- **Live gold & silver rate pricing** — metal-based products auto-calculate price from real-time market rates via GoldAPI.io, updated every hour
- Live rates banner displayed across shop pages (Gold 22k / 18k / Silver per gram)
- Product detail page with image gallery, quantity selector, and live rate badge
- **Related products** — up to 4 products from the same category shown on every product page
- **Recently viewed** — last 6 products a customer visited, stored in localStorage
- **Reviews & star ratings** — verified buyers can leave 1–5 star ratings and written reviews; average shown under the product name
- Shopping cart with quantity management
- Checkout with full shipping address form (Pay on Delivery)
- Order confirmation email sent automatically on every order placed
- My Orders — full order history with item breakdown
- Customer registration with automated welcome email
- Secure login / logout with JWT authentication

### Admin Panel
- Product management — create, edit, remove products
  - Fixed-price products: enter price manually
  - Metal-based products: set metal type (Gold 22k / 18k / Silver), weight in grams, and making charge % — price is calculated live automatically
- Category management — edit names, photos, display order, visibility
- Order management — view all customer orders, update status (Pending → Shipped → Delivered)
- Review moderation — admin can remove any review from the product page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Context API, Axios, Vite |
| Backend | ASP.NET Core 8 Web API, C# |
| Database | Microsoft SQL Server, Entity Framework Core 8 |
| Authentication | JWT tokens, BCrypt password hashing, role-based authorization |
| Email | MailKit (Gmail SMTP) |
| Live Rates | GoldAPI.io (fetched hourly via .NET BackgroundService) |
| Payment | Pay on Delivery (Razorpay integration prepared for future activation) |

---

## Project Structure

```
nagesha-jewellers/
├── backend/
│   └── NageshaJewellers.API/
│       ├── Controllers/     API endpoints
│       ├── Models/          Database entity classes
│       ├── DTOs/            Request/response shapes
│       ├── Data/            EF Core DbContext
│       └── Services/        JWT, Email, Metal rates, Background jobs
├── frontend/
│   └── nagesha-jewellers-app/
│       └── src/
│           ├── pages/       Full page components
│           ├── components/  Reusable UI components
│           ├── context/     Auth and Cart global state
│           ├── hooks/       Custom React hooks
│           ├── services/    API call functions
│           └── styles/      CSS per component
└── database/
    ├── 01_create_database.sql   Creates all tables
    ├── 02_seed_data.sql         Sample categories and products
    ├── 03_verify_metal_columns.sql
    └── 04_reviews.sql           Reviews table
```

---

## Database Schema

| Table | Purpose |
|---|---|
| Categories | Product categories with image and display order |
| Products | Full product details including metal type, weight, making charge |
| ProductImages | Multiple images per product |
| Users | Customer and admin accounts |
| Addresses | Saved delivery addresses |
| Orders | Placed orders with shipping details and status |
| OrderItems | Individual line items within each order |
| CartItems | Current basket contents per user |
| MetalRates | Live gold/silver rates cached from GoldAPI (updated hourly) |
| Reviews | Customer star ratings and written reviews |

---

## Getting Started

### Prerequisites
- Visual Studio 2022
- SQL Server (Express or higher)
- SQL Server Management Studio (SSMS)
- Node.js 18+

### 1 — Database setup
Open SSMS and run the scripts in order:
```
database/01_create_database.sql
database/02_seed_data.sql
database/04_reviews.sql
```

### 2 — Backend setup
1. Open `backend/NageshaJewellers.API/NageshaJewellers.API.csproj` in Visual Studio
2. Copy `appsettings.template.json` to `appsettings.json` and fill in your values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=NageshaJewellersDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "YOUR_LONG_RANDOM_SECRET_KEY_HERE",
    "Issuer": "NageshaJewellersAPI",
    "Audience": "NageshaJewellersApp"
  },
  "Email": {
    "FromAddress": "youremail@gmail.com",
    "FromName": "Nagesha Jewellers",
    "AppPassword": "YOUR_GMAIL_APP_PASSWORD",
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587"
  },
  "GoldApi": {
    "ApiKey": "YOUR_GOLDAPI_KEY",
    "BaseUrl": "https://www.goldapi.io/api/"
  }
}
```

3. Press F5 — Swagger opens at `https://localhost:PORT/swagger`
4. Confirm `GET /api/products` and `GET /api/categories` return data

### 3 — Frontend setup
```bash
cd frontend/nagesha-jewellers-app
npm install
```

Copy `.env.example` to `.env` and set your backend port:
```
VITE_API_URL=https://localhost:YOUR_PORT/api
```

```bash
npm run dev
```

Open `http://localhost:5173`

### 4 — Create your Admin account
1. Register via the website normally
2. In SSMS: `UPDATE Users SET Role = 'Admin' WHERE Email = 'youremail@example.com'`
3. Log in — you'll now see "Admin Panel" in the account menu

---

## Key Architecture Decisions

**Why JWT over sessions?**
Stateless authentication means any server instance can verify a token without shared session storage, keeping the backend horizontally scalable.

**Why soft-delete for products?**
Permanently deleting a product would orphan historical order records. Setting `IsActive = false` hides it from shoppers while preserving order history integrity.

**Why cache live metal rates in the database?**
Calling GoldAPI on every product page load would be slow and exhaust the free tier limit quickly. A .NET `BackgroundService` fetches rates once per hour and caches them in the `MetalRates` table — product price calculations read from this cache instantly.

**Why enforce purchase verification for reviews?**
Only customers who placed an order containing that product can leave a review. This prevents fake reviews and keeps ratings trustworthy.

**Why `EntityState.Modified` in UpdateProduct?**
The three metal columns (`MetalType`, `WeightInGrams`, `MakingChargePercent`) were added via raw SQL `ALTER TABLE` rather than EF Core migrations. Without explicitly marking the entity as Modified, EF Core's change tracker sometimes skips these columns.

---

## Security Notes

- Passwords hashed with BCrypt — never stored as plain text
- JWT tokens signed with a secret key — cannot be forged without it
- Role-based authorization enforced on the backend, not just the frontend UI
- `appsettings.json` excluded from version control via `.gitignore` — use `appsettings.template.json` as the shareable reference
- CORS configured to allow any localhost port in development; restrict to your real domain in production

---

## What's Next (Planned)

- Coupon / discount codes
- Wishlist / save for later
- Order tracking timeline (visual step-by-step)
- Admin sales dashboard with charts
- Product search
- Online payment via Razorpay (infrastructure already in place)

---

## Contact

Nagesha Jewellers · Opposite Ganapati Mandir, Main Road · Shirol, Tal. Shirol · Dist. Kolhapur, Maharashtra
