# Nagesha Jewellers — Frontend Setup Guide

This guide assumes your **backend is already running** and you saw products
appear in Swagger (`/swagger`). If you haven't done that yet, do it first —
the website is useless without the backend running alongside it.

## What you have

A complete React website with:
- Homepage with hero, category grid, trending products
- Shop page with category filtering and sorting
- Product detail page with image gallery
- Cart, checkout, and Razorpay payment
- Login / Register
- My Orders (order history)
- Admin Panel: manage products, manage orders

It's fully responsive — it will look good on phones, tablets, and desktops.

## Step 1 — Install Node.js (one-time only)

1. Go to https://nodejs.org
2. Download the **LTS** version (the recommended one, not "Current").
3. Run the installer, click Next through all the default options.
4. To check it worked, open Command Prompt (search "cmd" in the Windows
   Start menu) and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`. If you see an error instead,
   restart your computer and try again.

## Step 2 — Open a terminal in the project folder

1. Open the `frontend/nagesha-jewellers-app` folder in **File Explorer**.
2. Click in the address bar at the top, type `cmd`, and press Enter.
   (This opens a terminal already pointed at the right folder.)

   Alternative: open this folder in **VS Code**, then use
   **Terminal → New Terminal** from the menu.

## Step 3 — Install the project's libraries

In the terminal you just opened, type:

```
npm install
```

This downloads all the tools the website needs (React, React Router, Axios,
etc). It can take 1-3 minutes depending on your internet connection. You'll
see a progress bar and lots of text - that's normal. Wait until you get
your cursor back.

## Step 4 — Point the frontend at your backend

Open the file `.env` in the project folder (use Notepad or VS Code).
You'll see something like:

```
VITE_API_URL=https://localhost:62399/api
```

**The port number (the part after the second colon) must exactly match
whatever your backend is actually running on right now.** Look at your
browser's address bar when Swagger is open — if it shows
`https://localhost:62399/swagger`, then `62399` is correct. This number
can change between runs if Visual Studio assigns a different port, so if
login/register suddenly stop working after restarting the backend, this
is the first thing to check.

## Step 5 — Run the website

Back in your terminal, type:

```
npm run dev
```

You'll see something like:

```
  VITE v5.x.x  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```

Open your browser and go to **http://localhost:5173** — your jewellery
website should appear.

**Keep both terminals/windows running at the same time:**
- One running the backend (Visual Studio, F5)
- One running the frontend (`npm run dev`)

If you close either one, the site will stop working correctly.

## Step 6 — Test that everything is connected

Try these in order:

1. **Homepage loads** with sample products → frontend can reach the
   backend successfully.
2. **Click "Shop All"** → you should see all 10 sample products.
3. **Click on a product** → the detail page should open.
4. **Click "Create account"** → register with a test email/password.
5. **Add a product to your bag**, go to **Cart**, then **Checkout**.
6. **Fill in shipping details** and click "Pay" → the Razorpay popup
   should appear (this needs the Razorpay test keys from the backend
   setup guide — if you skipped that step, this is where you'd add them).
   For Razorpay's TEST mode, you can "pay" using their test card number
   `4111 1111 1111 1111`, any future expiry date, and any CVV.
7. After payment, you should land on an **Order Confirmed** page, and the
   order should appear under **My Orders**.

## Step 7 — Set up your Admin access in the website

This follows on from Step 6 in the backend guide, where you changed your
account's Role to "Admin" in SQL Server.

1. Log out, then log back in with that Admin account.
2. Click the account icon (top right) → you should now see an
   **"Admin Panel"** link.
3. In the Admin Panel:
   - **Products tab**: Add/Edit/Remove products. For image URLs, you can
     use any direct image link — for example, upload your jewellery
     photos to a free image host like https://imgur.com and paste the
     direct image link here.
   - **Orders tab**: See every customer order, change status as you pack
     and ship (Pending → Paid → Shipped → Delivered).

## Common problems and fixes

**Homepage is blank / "Network Error" in browser console**
→ Your backend isn't running, or the port in `.env` doesn't match it.
  Check Visual Studio is still running (F5), and double check the port number.

**"This site can't provide a secure connection" (SSL warning)**
→ Your backend uses `https://localhost:...` with a self-signed development
  certificate. The very first time, your browser may show a warning page —
  click "Advanced" → "Proceed anyway" (text varies by browser). This is
  normal for local development and won't happen on a real published site.

**Razorpay popup doesn't open / shows an error**
→ Check `appsettings.json` in the backend has real Razorpay TEST keys
  (not the placeholder text). Restart the backend (stop and press F5 again)
  after changing appsettings.json - it only reads this file on startup.

**Changes I make to the code don't show up in the browser**
→ Vite usually updates automatically when you save a file. If it doesn't,
  refresh the browser tab. If that still doesn't help, stop the terminal
  (Ctrl+C) and run `npm run dev` again.

**"npm install" shows errors about permissions**
→ Try running your terminal "as Administrator" (right-click Command
  Prompt → Run as administrator), then run `npm install` again.

## Publishing the site for real customers (when you're ready)

Right now, both backend and frontend only run on YOUR computer
(`localhost`) - nobody else can see the site. To make it public, you'll
eventually need:
- A hosting service for the .NET backend (e.g. Azure App Service)
- A hosting service for the React frontend (e.g. Azure Static Web Apps,
  Netlify, or Vercel)
- A real SQL Server database (e.g. Azure SQL)
- Switching Razorpay from Test Mode keys to Live Mode keys

This is a separate step we can tackle once you're happy testing locally —
just let me know when you're ready and we'll go through it the same way,
one step at a time.
