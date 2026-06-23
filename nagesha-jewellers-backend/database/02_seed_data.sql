/* ===================================================================
   NAGESHA JEWELLERS - SAMPLE DATA (SEED SCRIPT)
   ===================================================================
   WHAT THIS DOES:
   Adds a few sample categories and products so your website isn't
   empty when you first run it. You can delete these later from the
   Admin Panel once you add your real products.

   HOW TO RUN:
   Run 01_create_database.sql FIRST, then run this file the same way
   (open in SSMS, click Execute).
   =================================================================== */

USE NageshaJewellersDB;
GO

-- Only insert if the Categories table is empty (avoids duplicate rows
-- if you accidentally run this script twice)
IF NOT EXISTS (SELECT 1 FROM Categories)
BEGIN
    INSERT INTO Categories (Name, Slug, ImageUrl, DisplayOrder) VALUES
    ('Earrings',  'earrings',  '/images/categories/earrings.jpg',  1),
    ('Necklaces', 'necklaces', '/images/categories/necklaces.jpg', 2),
    ('Bracelets', 'bracelets', '/images/categories/bracelets.jpg', 3),
    ('Rings',     'rings',     '/images/categories/rings.jpg',     4);
END
GO

IF NOT EXISTS (SELECT 1 FROM Products)
BEGIN
    DECLARE @EarringsId INT  = (SELECT CategoryId FROM Categories WHERE Slug = 'earrings');
    DECLARE @NecklacesId INT = (SELECT CategoryId FROM Categories WHERE Slug = 'necklaces');
    DECLARE @BraceletsId INT = (SELECT CategoryId FROM Categories WHERE Slug = 'bracelets');
    DECLARE @RingsId INT     = (SELECT CategoryId FROM Categories WHERE Slug = 'rings');

    INSERT INTO Products (Name, Slug, Description, Material, Price, CompareAtPrice, StockQuantity, SKU, CategoryId, IsFeatured) VALUES
    ('Pavé Interlocking Earrings', 'pave-interlocking-earrings', 'Delicate interlocking hoops finished with sparkling pavé stones.', '18k Gold Plated', 1799.00, 2599.00, 25, 'NJ-EAR-001', @EarringsId, 1),
    ('Statement Taper Hoop Earrings', 'statement-taper-hoop-earrings', 'Bold tapered hoops that catch the light beautifully.', '18k Gold Plated', 1899.00, NULL, 18, 'NJ-EAR-002', @EarringsId, 1),
    ('Pearl Drop Hoop Earrings', 'pearl-drop-hoop-earrings', 'Classic hoops with a freshwater pearl drop.', '925 Sterling Silver', 1499.00, NULL, 30, 'NJ-EAR-003', @EarringsId, 0),

    ('Layered Open Circle Necklace', 'layered-open-circle-necklace', 'A three-row layered necklace with open circle pendants.', '18k Gold Plated', 2499.00, NULL, 20, 'NJ-NCK-001', @NecklacesId, 1),
    ('Pearl Medallion Necklace', 'pearl-medallion-necklace', 'Two-row necklace featuring a pearl medallion centrepiece.', '18k Gold Plated', 1299.00, 1899.00, 15, 'NJ-NCK-002', @NecklacesId, 0),
    ('Initial Bubble Necklace', 'initial-bubble-necklace', 'Personalise with your favourite initial - a thoughtful gift.', '925 Sterling Silver', 999.00, NULL, 40, 'NJ-NCK-003', @NecklacesId, 1),

    ('Interlocking Bangles - Gold', 'interlocking-bangles-gold', 'Set of fine interlocking bangles for everyday stacking.', '18k Gold Plated', 1599.00, 2299.00, 22, 'NJ-BRC-001', @BraceletsId, 1),
    ('Crystal Tennis Bracelet', 'crystal-tennis-bracelet', 'A timeless tennis bracelet lined with sparkling crystals.', '18k Gold Plated', 2999.00, NULL, 12, 'NJ-BRC-002', @BraceletsId, 0),

    ('Crystal Starburst Signet Ring', 'crystal-starburst-signet-ring', 'A statement signet ring with a starburst crystal face.', '18k Gold Plated', 1399.00, NULL, 25, 'NJ-RNG-001', @RingsId, 1),
    ('Adjustable Stacking Ring Set', 'adjustable-stacking-ring-set', 'Set of 3 adjustable rings designed to be worn together.', '925 Sterling Silver', 1199.00, 1599.00, 30, 'NJ-RNG-002', @RingsId, 0);

    -- Add one placeholder image per product (replace with your real photo URLs later)
    INSERT INTO ProductImages (ProductId, ImageUrl, DisplayOrder)
    SELECT ProductId, '/images/products/placeholder.jpg', 0 FROM Products;
END
GO

PRINT 'Sample data inserted successfully.';
GO
