USE NageshaJewellersDB;

-- Reviews table: one row per review left by a customer on a product.
-- We link to both Users (who wrote it) and Products (what they reviewed).
-- We also store a copy of the user's name so it still shows correctly
-- even if the user later changes their name on their account.
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
BEGIN
    CREATE TABLE Reviews (
        ReviewId        INT IDENTITY(1,1) PRIMARY KEY,
        ProductId       INT NOT NULL,
        UserId          INT NOT NULL,
        UserFullName    NVARCHAR(150) NOT NULL,  -- snapshot at time of review
        Rating          INT NOT NULL,             -- 1 to 5 stars
        Title           NVARCHAR(150) NULL,       -- e.g. "Beautiful necklace!"
        Body            NVARCHAR(1000) NULL,      -- the written review text
        CreatedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_Reviews_Products FOREIGN KEY (ProductId)
            REFERENCES Products(ProductId) ON DELETE CASCADE,
        CONSTRAINT FK_Reviews_Users FOREIGN KEY (UserId)
            REFERENCES Users(UserId),
        CONSTRAINT CHK_Reviews_Rating CHECK (Rating >= 1 AND Rating <= 5),

        -- One review per customer per product
        -- (prevents spamming multiple reviews)
        CONSTRAINT UQ_Reviews_UserProduct UNIQUE (UserId, ProductId)
    );

    PRINT 'Reviews table created successfully.';
END
ELSE
BEGIN
    PRINT 'Reviews table already exists - nothing to do.';
END
GO
