# Nagesha Jewellers — E-Commerce Web Application

A full-stack e-commerce website for an online jewellery store, built with
React, ASP.NET Core Web API, and SQL Server.

## Project Structure

```
nagesha-jewellers/
├── backend/    → ASP.NET Core Web API (C#)
├── frontend/   → React application (Vite)
└── database/   → SQL Server setup scripts
```

## Features

- Product catalog with category filtering
- Customer registration/login (JWT authentication)
- Shopping cart
- Checkout (currently Pay on Delivery)
- Order confirmation emails
- Order history for customers
- Admin panel: manage products, categories, and orders

## Tech Stack

- **Frontend:** React, React Router, Axios, Vite
- **Backend:** ASP.NET Core Web API, Entity Framework Core
- **Database:** Microsoft SQL Server
- **Auth:** JWT tokens, BCrypt password hashing
- **Email:** MailKit (Gmail SMTP)

## Getting Started

This project has two parts that both need to be running at the same time:

1. **Database + Backend setup** → see `backend/SETUP_GUIDE.md`
2. **Frontend setup** → see `frontend/SETUP_GUIDE.md`

Follow the backend guide first, confirm it works in Swagger, then follow
the frontend guide.

## Important: Setting Up Secrets

This repository does **not** include real secrets (database passwords,
JWT signing key, email credentials, payment keys) — those stay only on
your own computer and are never uploaded to GitHub.

- Backend: copy `backend/NageshaJewellers.API/appsettings.template.json`
  to a new file named `appsettings.json` in the same folder, then fill in
  your real values.
- Frontend: copy `frontend/nagesha-jewellers-app/.env.example` to a new
  file named `.env` in the same folder, then set the correct backend URL.

Both `appsettings.json` and `.env` are intentionally excluded via
`.gitignore` so they can never be accidentally committed.