# Nagesha Jewellers — Backend Setup Guide

This guide assumes Visual Studio and SQL Server are already installed on your machine.

## What you have

A complete .NET Web API project with:
- Product catalog (browse + view single product)
- Customer registration/login (JWT tokens)
- Shopping cart
- Checkout + Razorpay payment
- Order history
- Admin endpoints (manage products, view/update all orders)

## Step 1 — Create the database

1. Open **SQL Server Management Studio (SSMS)** and connect to your local server.
2. Open `database/01_create_database.sql` → click **Execute** (or press F5).
3. Open `database/02_seed_data.sql` → click **Execute**.

This creates the `NageshaJewellersDB` database with 8 tables and a few sample products.

## Step 2 — Open the backend project

1. Open **Visual Studio**.
2. Click **Open a project or solution**.
3. Browse to `backend/NageshaJewellers.API/NageshaJewellers.API.csproj` and open it.
4. Visual Studio will automatically download the required packages (you'll see "Restoring NuGet packages" at the bottom). Wait for this to finish.

## Step 3 — Check your database connection string

Open `appsettings.json` in the project. Find this line:

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=NageshaJewellersDB;Trusted_Connection=True;TrustServerCertificate=True;"
```

- If your SQL Server instance name is different from `SQLEXPRESS`, change that part.
  (In SSMS, the server name you connected with in Step 1 is what goes here.)
- If you used **SQL Server Authentication** (a username/password) instead of Windows login,
  replace `Trusted_Connection=True` with `User Id=yourusername;Password=yourpassword;`

## Step 4 — Get free Razorpay test keys (for payment testing)

1. Go to https://dashboard.razorpay.com and sign up (free).
2. Make sure you're in **Test Mode** (toggle is usually top-right).
3. Go to **Settings → API Keys → Generate Test Key**.
4. Copy the **Key Id** and **Key Secret**.
5. Paste them into `appsettings.json`:

```json
"Razorpay": {
  "KeyId": "rzp_test_xxxxxxxxxxxxx",
  "KeySecret": "xxxxxxxxxxxxxxxxxxxxx"
}
```

You can skip this step for now if you just want to test product browsing —
only the checkout/payment endpoints need these keys.

## Step 4B — Set up the "Welcome" email after registration

This sends a thank-you email automatically whenever someone creates an
account. It uses your Gmail account to send the email for free.

**Important: you cannot use your normal Gmail password here.** Google
blocks that for security. You need to create a special "App Password"
instead - a one-time setup, takes about 2 minutes:

1. Go to https://myaccount.google.com/security
2. Make sure **2-Step Verification** is turned ON for your Google account.
   (If it's off, turn it on first — App Passwords require this.)
3. Go to https://myaccount.google.com/apppasswords
4. Under "App name", type something like `Nagesha Jewellers Backend` and
   click **Create**.
5. Google will show you a 16-character password (like `abcd efgh ijkl mnop`).
   **Copy this — you won't be able to see it again.**
6. Open `appsettings.json` and fill in the `Email` section:

```json
"Email": {
  "FromAddress": "youractualgmail@gmail.com",
  "FromName": "Nagesha Jewellers",
  "AppPassword": "abcdefghijklmnop",
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": "587"
}
```

   (Paste the 16-character password with no spaces in `AppPassword`.)

If you skip this step, registration will still work perfectly fine — the
website just won't send the welcome email, and you'll see a warning
message about it in the Visual Studio output window (this is expected
and harmless until you set it up).

## Step 5 — Run the backend

1. In Visual Studio, press **F5** (or click the green "Play" button at the top).
2. A browser window will open automatically to something like:
   `https://localhost:7050/swagger`
3. This is **Swagger** — a free testing page where you can try every API
   endpoint by clicking "Try it out". This is how you check things work
   BEFORE connecting React to it.

### Quick test in Swagger:
1. Find `GET /api/categories` → click it → click "Try it out" → click "Execute".
   You should see Earrings, Necklaces, Bracelets, Rings come back.
2. Find `GET /api/products` → "Try it out" → "Execute".
   You should see the 10 sample products come back.

If both of those work, your backend is running correctly.

## Step 6 — Create your first Admin account

There's no "make me an admin" button (for security, admin accounts aren't
self-service). Do this once, manually:

1. In Swagger, use `POST /api/auth/register` to create a normal account
   (use your own name/email/password).
2. Go to SSMS → open `NageshaJewellersDB` → table `Users` → find your new row.
3. Right-click the table → **Edit Top 200 Rows** → change your row's
   `Role` column from `Customer` to `Admin` → save.
4. Next time you log in via `POST /api/auth/login`, your token will include
   the Admin role, and the `/api/admin/...` and product create/edit/delete
   endpoints will work for you.

## Common problems and fixes

**Browser console shows "blocked by CORS policy"**
→ This means your React app's address and what the backend allows don't
  match. This project's backend is already set up to allow any
  `localhost` port automatically, so this should only happen if you changed
  the CORS code. If you see this, make sure `Program.cs` still has the
  `AllowReactApp` policy from this project (don't replace it with a single
  fixed port like `5173` only — Vite sometimes picks 5174, 5175, etc. if
  5173 is busy).

**"Cannot open database... login failed"**
→ Your connection string server name is wrong. In SSMS, check exactly what
  you typed in the "Server name" box when you connected — copy that exactly
  into appsettings.json.

**Swagger page is blank or shows an error**
→ Check the Visual Studio "Output" or "Error List" panel for red error text —
  it usually points to a missing NuGet package. Right-click the project →
  "Manage NuGet Packages" → check everything in the .csproj file is installed.

**"Unable to connect to any of the specified MySQL hosts" or similar**
→ Make sure SQL Server service is actually running. Open Windows
  "Services" app → find "SQL Server (SQLEXPRESS)" → make sure status is "Running".

## What's next

Once this backend is confirmed working in Swagger, the React frontend
(in the `frontend/` folder) is what customers will actually use — it calls
these same API endpoints behind the scenes.
