/* ===================================================================
   NAGESHA JEWELLERS - DATABASE SETUP SCRIPT
   ===================================================================
   WHAT THIS FILE DOES (in plain words):
   This script builds the entire database from scratch. Think of the
   database as a set of Excel-like sheets (called "tables") that store
   everything: products, categories, customer accounts, orders, etc.

   HOW TO RUN THIS:
   1. Open "SQL Server Management Studio" (SSMS).
   2. Connect to your local SQL Server.
   3. Open this file (File > Open > File...).
   4. Click "Execute" (or press F5).
   That's it - the database and all tables will be created.
   =================================================================== */

-- Step 1: Create the database itself (like creating a new Excel workbook)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'NageshaJewellersDB')
BEGIN
    CREATE DATABASE NageshaJewellersDB;
END
GO

USE NageshaJewellersDB;
GO

/* ===================================================================
   TABLE: Categories
   Think of this as: Earrings, Necklaces, Bracelets, Rings, etc.
   =================================================================== */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        CategoryId      INT IDENTITY(1,1) PRIMARY KEY,   -- auto-numbered ID
        Name            NVARCHAR(100) NOT NULL,          -- e.g. "Necklaces"
        Slug            NVARCHAR(120) NOT NULL UNIQUE,   -- e.g. "necklaces" (used in URL)
        ImageUrl        NVARCHAR(500) NULL,               -- picture shown on homepage
        DisplayOrder    INT NOT NULL DEFAULT 0,           -- controls menu order
        IsActive        BIT NOT NULL DEFAULT 1,           -- 1 = visible, 0 = hidden
        CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

/* ===================================================================
   TABLE: Products
   Every item you sell: a necklace, a ring, etc.
   =================================================================== */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        ProductId       INT IDENTITY(1,1) PRIMARY KEY,
        Name            NVARCHAR(200) NOT NULL,
        Slug            NVARCHAR(220) NOT NULL UNIQUE,
        Description     NVARCHAR(MAX) NULL,
        Material        NVARCHAR(100) NULL,              -- e.g. "18k Gold Plated"
        Price           DECIMAL(10,2) NOT NULL,           -- current selling price
        CompareAtPrice  DECIMAL(10,2) NULL,               -- original price (for "Sale" strike-through)
        StockQuantity   INT NOT NULL DEFAULT 0,
        SKU             NVARCHAR(50) NULL,
        CategoryId      INT NOT NULL,
        IsFeatured      BIT NOT NULL DEFAULT 0,           -- show on homepage "Trending"
        IsActive        BIT NOT NULL DEFAULT 1,           -- 0 = hidden from shoppers
        CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId)
            REFERENCES Categories(CategoryId)
    );
END
GO

/* ===================================================================
   TABLE: ProductImages
   Each product can have multiple photos.
   =================================================================== */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductImages')
BEGIN
    CREATE TABLE ProductImages (
        ProductImageId  INT IDENTITY(1,1) PRIMARY KEY,
        ProductId       INT NOT NULL,
        ImageUrl        NVARCHAR(500) NOT NULL,
        DisplayOrder    INT NOT NULL DEFAULT 0,
        CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductId)
            REFERENCES Products(ProductId) ON DELETE CASCADE
    );
END
GO

/* ===================================================================
   TABLE: Users
   Customer (and admin) accounts.
   Passwords are NEVER stored in plain text - only a scrambled
   ("hashed") version is stored, for security.
   =================================================================== */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId          INT IDENTITY(1,1) PRIMARY KEY,
        FullName        NVARCHAR(150) NOT NULL,
        Email           NVARCHAR(200) NOT NULL UNIQUE,
        PasswordHash    NVARCHAR(500) NOT NULL,
        Phone           NVARCHAR(20) NULL,
        Role            NVARCHAR(20) NOT NULL DEFAULT 'Customer',  -- 'Customer' or 'Admin'
        CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

/* ===================================================================
   TABLE: Addresses
   A customer can save delivery addresses.
   =================================================================== */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Addresses')
BEGIN
    CREATE TABLE Addresses (
        AddressId       INT IDENTITY(1,1) PRIMARY KEY,
        UserId          INT NOT NULL,
        FullName        NVARCHAR(150) NOT NULL,
        Phone           NVARCHAR(20) NOT NULL,
        Line1           NVARCHAR(250) NOT NULL,
        Line2           NVARCHAR(250) NULL,
        City            NVARCHAR(100) NOT NULL,
        State           NVARCHAR(100) NOT NULL,
        PostalCode      NVARCHAR(20) NOT NULL,
        Country         NVARCHAR(100) NOT NULL DEFAULT 'India',
        IsDefault       BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_Addresses_Users FOREIGN KEY (UserId)
            REFERENCES Users(UserId) ON DELETE CASCADE
    );
END
GO

/* ===================================================================
   TABLE: Orders
   One row = one placed order (a "receipt").
   =================================================================== */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
    CREATE TABLE Orders (
        OrderId             INT IDENTITY(1,1) PRIMARY KEY,
        UserId              INT NOT NULL,
        OrderNumber         NVARCHAR(30) NOT NULL UNIQUE,   -- e.g. "NJ-100023"
        TotalAmount         DECIMAL(10,2) NOT NULL,
        Status              NVARCHAR(30) NOT NULL DEFAULT 'Pending',
                            -- Pending, Paid, Shipped, Delivered, Cancelled
        ShippingFullName    NVARCHAR(150) NOT NULL,
        ShippingPhone       NVARCHAR(20) NOT NULL,
        ShippingLine1       NVARCHAR(250) NOT NULL,
        ShippingLine2       NVARCHAR(250) NULL,
        ShippingCity        NVARCHAR(100) NOT NULL,
        ShippingState       NVARCHAR(100) NOT NULL,
        ShippingPostalCode  NVARCHAR(20) NOT NULL,
        RazorpayOrderId     NVARCHAR(100) NULL,   -- ID given to us by Razorpay (payment gateway)
        RazorpayPaymentId   NVARCHAR(100) NULL,    -- filled in once payment succeeds
        PaymentStatus       NVARCHAR(30) NOT NULL DEFAULT 'Unpaid', -- Unpaid, Paid, Failed
        CreatedAt           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId)
            REFERENCES Users(UserId)
    );
END
GO

/* ===================================================================
   TABLE: OrderItems
   Each product inside an order. One order can have many items.
   =================================================================== */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
BEGIN
    CREATE TABLE OrderItems (
        OrderItemId     INT IDENTITY(1,1) PRIMARY KEY,
        OrderId         INT NOT NULL,
        ProductId       INT NOT NULL,
        ProductName     NVARCHAR(200) NOT NULL,   -- copied at time of order (in case product changes later)
        UnitPrice       DECIMAL(10,2) NOT NULL,
        Quantity        INT NOT NULL,
        CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId)
            REFERENCES Orders(OrderId) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId)
            REFERENCES Products(ProductId)
    );
END
GO

/* ===================================================================
   TABLE: CartItems
   What a logged-in customer currently has in their basket.
   (Not yet ordered/paid.)
   =================================================================== */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CartItems')
BEGIN
    CREATE TABLE CartItems (
        CartItemId      INT IDENTITY(1,1) PRIMARY KEY,
        UserId          INT NOT NULL,
        ProductId       INT NOT NULL,
        Quantity        INT NOT NULL DEFAULT 1,
        AddedAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_CartItems_Users FOREIGN KEY (UserId)
            REFERENCES Users(UserId) ON DELETE CASCADE,
        CONSTRAINT FK_CartItems_Products FOREIGN KEY (ProductId)
            REFERENCES Products(ProductId)
    );
END
GO

PRINT 'All tables created successfully.';
GO
