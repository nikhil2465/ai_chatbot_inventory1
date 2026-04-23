-- =============================================================================
-- InvenIQ — Migration v2: Louvers Products, Quotation Suppliers & Quotations Table
-- Run against an EXISTING stocksense_inventory database (schema already applied).
-- Safe to re-run: uses ALTER IF NOT EXISTS / INSERT IGNORE patterns.
-- =============================================================================

USE stocksense_inventory;

-- ── 1. Extend products.category ENUM ──────────────────────────────────────────
ALTER TABLE products
  MODIFY COLUMN category ENUM(
    'BWP Plywood','MR Plywood','Commercial','Laminate','Flexi',
    'High Pressure Laminate','Compact Laminate','Acrylic',
    'Louvers','Operable Louvre System'
  ) NOT NULL;

-- ── 2. Add quotations table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotations (
    quotation_id      INT AUTO_INCREMENT PRIMARY KEY,
    product_id        INT           NOT NULL,
    supplier_id       INT           NOT NULL,
    quote_date        DATE          NOT NULL,
    rate              DECIMAL(10,2) NOT NULL,
    freight_cost      DECIMAL(8,2)  DEFAULT 0,
    moq               INT           DEFAULT 1,
    lead_time_days    INT           DEFAULT 7,
    valid_till        DATE,
    reliability_pct   DECIMAL(5,2)  DEFAULT 90.00,
    notes             VARCHAR(255),
    is_last_purchased TINYINT(1)    DEFAULT 0,
    is_active         TINYINT(1)    DEFAULT 1,
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product  (product_id),
    INDEX idx_supplier (supplier_id),
    FOREIGN KEY (product_id)  REFERENCES products(product_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- ── 3. New products: HPL Laminates + Louvers (product_id 19-25) ───────────────
INSERT IGNORE INTO products
  (product_id, sku_code, sku_name, brand, category, thickness_mm, size_ft, unit, buy_price, sell_price, reorder_level, abc_class)
VALUES
-- HPL & Advanced Laminates
(19, 'HPL-1MM-MATTE',      'HPL 1mm Matte (8x4)',                   'Greenlam', 'High Pressure Laminate',  1.0, '8x4', 'sheet', 1080, 1300, 50, 'B'),
(20, 'HPL-COMPACT-6MM',    'HPL Compact 6mm (8x4)',                  'Greenlam', 'Compact Laminate',        6.0, '8x4', 'sheet', 2980, 3600, 25, 'B'),
(21, 'ACRYLIC-LAM-84',     'Acrylic Laminate (8x4)',                 'Generic',  'Acrylic',                 1.0, '8x4', 'sheet', 1720, 2100, 20, 'B'),
-- Louvers
(22, 'LOUV-ALU-Z100-ANOD', 'Aluminium Z-Profile 100mm Anodized',     'Generic',  'Louvers',                NULL, NULL,  'RM',   1720, 2100, 50, 'A'),
(23, 'LOUV-ALU-Z80-PC',    'Aluminium Z-Profile 80mm Powder Coated', 'Generic',  'Louvers',                NULL, NULL,  'RM',   1350, 1680, 40, 'A'),
(24, 'LOUV-PVC-100',       'PVC Louver Blades 100mm',                'Generic',  'Louvers',                NULL, NULL,  'RM',    390,  580, 80, 'B'),
(25, 'LOUV-OPS-MTR',       'Operable Louvre System (Motorised)',     'Generic',  'Operable Louvre System', NULL, NULL,  'SQM',  9200,12000,  5, 'A');

-- ── 4. New suppliers (supplier_id 5-20) ───────────────────────────────────────
INSERT IGNORE INTO suppliers
  (supplier_id, supplier_name, contact_person, phone, email, city, on_time_pct, avg_delay_days, lead_time_days, freight_per_sheet, price_vs_market, grn_match_rate, recommendation)
VALUES
-- Laminates & Plywood suppliers
(5,  'Kitply Industries',        'Sanjay Mehta',     '9871234501', 'sanjay@kitply.com',        'Kolkata',     71.0, 3.8,  8, 14.00, '-6% below market',   74.0, 'CAUTION'),
(6,  'Archidply Industries',     'Ravi Patel',       '9871234502', 'ravi@archidply.com',       'Bangalore',   68.0, 4.5, 10, 16.00, '-8% below market',   70.0, 'CAUTION'),
(7,  'Merino Industries',        'Deepak Gupta',     '9871234503', 'deepak@merino.com',        'Kolkata',     94.0, 0.8,  7, 18.00, '+6% above market',   96.0, 'GOOD'),
(8,  'Action Tesa',              'Kiran Shah',       '9871234504', 'kiran@actiontesa.com',     'Ahmedabad',   82.0, 1.5,  8, 20.00, '-4% below market',   88.0, 'GOOD'),
(9,  'Formica India',            'Prashant Joshi',   '9871234505', 'prashant@formica.com',     'Mumbai',      97.0, 0.3,  5, 16.00, '+12% above market',  98.0, 'PREFERRED'),
(10, 'Stylam Industries',        'Ankit Verma',      '9871234506', 'ankit@stylam.com',         'Panchkula',   79.0, 2.8, 10, 32.00, '-9% below market',   81.0, 'REVIEW'),
(11, 'Durian Industries',        'Rohan Das',        '9871234507', 'rohan@durian.com',         'Mumbai',      88.0, 1.1,  7, 18.00, 'At market rate',     91.0, 'GOOD'),
-- Louvers & Aluminium suppliers
(12, 'Alufit Systems',           'Mahesh Iyer',      '9871234508', 'mahesh@alufit.com',        'Ahmedabad',   92.0, 1.0, 10, NULL, '+8% above market',   94.0, 'GOOD'),
(13, 'Supreme Profile India',    'Rajiv Bose',       '9871234509', 'rajiv@supremeprofile.com', 'Bangalore',   85.0, 1.8,  8, NULL, 'At market rate',     88.0, 'GOOD'),
(14, 'Alumax Profiles',          'Sunil Tiwari',     '9871234510', 'sunil@alumax.com',         'Surat',       78.0, 3.2, 12, NULL, '-4% below market',   80.0, 'REVIEW'),
(15, 'Jindal Aluminium',         'Vikram Jindal',    '9871234511', 'vikram@jindalalu.com',     'Delhi',       95.0, 0.5,  9, NULL, '+4% above market',   97.0, 'PREFERRED'),
(16, 'Aluline India',            'Neeraj Kapoor',    '9871234512', 'neeraj@aluline.com',       'Pune',        83.0, 1.9,  9, NULL, '-2% below market',   86.0, 'GOOD'),
(17, 'Coltors India',            'Farhan Qureshi',   '9871234513', 'farhan@coltors.com',       'Chennai',     80.0, 2.2,  6, NULL, '+2% above market',   82.0, 'GOOD'),
(18, 'Polycab India',            'Arun Pillai',      '9871234514', 'arun@polycab.com',         'Halol',       90.0, 0.9,  4, NULL, '+8% above market',   93.0, 'GOOD'),
(19, 'Technal India',            'Laurent Dubois',   '9871234515', 'laurent@technal.com',      'Mumbai',      96.0, 0.4, 18, NULL, '+14% above market',  98.0, 'PREFERRED'),
(20, 'YKK AP India',             'Hiroshi Tanaka',   '9871234516', 'hiroshi@ykk-ap.com',       'Bangalore',   98.0, 0.2, 25, NULL, '+28% above market',  99.0, 'PREFERRED');

-- ── 5. Quotation data (30 rows across 9 items) ────────────────────────────────
-- Remove any existing quotation rows for these products to allow clean re-import
DELETE FROM quotations WHERE product_id IN (1, 4, 19, 20, 21, 22, 23, 24, 25);

INSERT INTO quotations
  (product_id, supplier_id, quote_date, rate, freight_cost, moq, lead_time_days, valid_till, reliability_pct, notes, is_last_purchased)
VALUES

-- 18mm BWP (product_id=1)
(1,  1,  '2026-04-01', 1680, 15, 100, 6,  '2026-04-30', 96.0, 'ISI certified, consistent quality', 1),
(1,  2,  '2026-04-01', 1720, 12, 150, 5,  '2026-04-25', 84.0, 'Faster delivery, premium packaging', 0),
(1,  5,  '2026-04-01', 1595, 18, 200, 8,  '2026-04-20', 71.0, 'Cheapest rate, grade inconsistency reported', 0),
(1,  6,  '2026-04-01', 1560, 20, 250, 10, '2026-04-18', 68.0, 'Lowest rate — verify grade before ordering', 0),

-- 12mm MR Plain (product_id=4)
(4,  1,  '2026-04-01',  800, 14, 100, 6,  '2026-04-30', 96.0, 'Century premium grade', 0),
(4,  2,  '2026-04-01',  780, 11, 200, 5,  '2026-04-28', 84.0, 'Bulk discount >500 sheets', 1),
(4,  6,  '2026-04-01',  740, 19, 300, 9,  '2026-04-22', 68.0, 'High MOQ, plan 10 days ahead', 0),

-- HPL 1mm Matte (product_id=19)
(19, 7,  '2026-04-05', 1150, 22,  50, 7,  '2026-05-15', 94.0, 'Premium finish, consistent colour match', 0),
(19, 4,  '2026-04-05', 1080, 18,  50, 6,  '2026-05-10', 91.0, 'Best overall value', 1),
(19, 8,  '2026-04-05',  990, 25, 100, 8,  '2026-04-30', 82.0, 'Competitive rate, wider colour range', 0),
(19, 9,  '2026-04-05', 1225, 20,  30, 5,  '2026-05-20', 97.0, 'International brand, highest reliability', 0),

-- HPL Compact 6mm (product_id=20)
(20, 7,  '2026-04-05', 3200, 35,  20, 7,  '2026-05-15', 94.0, 'FR-rated option available', 0),
(20, 4,  '2026-04-05', 2980, 28,  25, 6,  '2026-05-10', 91.0, 'Reliable grade, best price-quality', 1),
(20, 10, '2026-04-05', 2750, 40,  30, 10, '2026-04-28', 79.0, 'Lowest rate, longer lead time', 0),

-- Acrylic Laminate (product_id=21)
(21, 8,  '2026-04-05', 1850, 28,  25, 8,  '2026-05-01', 82.0, 'Widest colour palette (180+ shades)', 0),
(21, 11, '2026-04-05', 1720, 22,  20, 7,  '2026-04-30', 88.0, 'Anti-scratch coating included', 1),
(21, 7,  '2026-04-05', 1960, 24,  30, 6,  '2026-05-10', 94.0, 'Premium UV-resistant grade', 0),

-- Aluminium Z-Profile 100mm Anodized (product_id=22)
(22, 12, '2026-04-08', 1850, 45,  50, 10, '2026-05-15', 92.0, 'AA-25 anodizing, QUALICOAT certified', 0),
(22, 13, '2026-04-08', 1720, 38,  75, 8,  '2026-05-10', 85.0, 'Best price for bulk orders >200 RM', 1),
(22, 14, '2026-04-08', 1680, 52, 100, 12, '2026-05-05', 78.0, 'Cheaper, verify anodize thickness', 0),
(22, 15, '2026-04-08', 1790, 35,  60, 9,  '2026-05-20', 95.0, 'Most reliable, consistent alloy grade', 0),

-- Aluminium Z-Profile 80mm Powder Coated (product_id=23)
(23, 12, '2026-04-08', 1480, 40,  50, 12, '2026-05-15', 92.0, 'PVDF coating, 20-yr warranty', 0),
(23, 16, '2026-04-08', 1350, 35,  80, 9,  '2026-05-08', 83.0, 'Polyester powder coat, standard colours', 1),
(23, 13, '2026-04-08', 1290, 42, 100, 10, '2026-05-05', 85.0, 'Lowest rate — custom RAL +7 days lead', 0),

-- PVC Louver Blades 100mm (product_id=24)
(24, 17, '2026-04-08',  420, 18, 100, 6,  '2026-04-30', 80.0, 'UV stabilised, 10-yr warranty', 0),
(24, 13, '2026-04-08',  390, 15, 150, 5,  '2026-05-10', 85.0, 'Best value PVC grade', 1),
(24, 18, '2026-04-08',  445, 12, 100, 4,  '2026-05-15', 90.0, 'Highest grade PVC, fire retardant', 0),

-- Operable Louvre System Motorised (product_id=25)
(25, 12, '2026-04-10', 8500, 200, 10, 21, '2026-05-30', 92.0, 'Somfy motor, 5-yr system warranty', 0),
(25, 19, '2026-04-10', 9200, 180,  8, 18, '2026-05-25', 96.0, 'European quality, BIM files available', 1),
(25, 20, '2026-04-10',10500, 150,  5, 25, '2026-06-15', 98.0, 'Premium — architectural specification grade', 0);

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT
  'migration_v2 applied successfully' AS status,
  (SELECT COUNT(*) FROM products WHERE category IN ('Louvers','Operable Louvre System','High Pressure Laminate','Compact Laminate','Acrylic')) AS new_product_count,
  (SELECT COUNT(*) FROM suppliers WHERE supplier_id >= 5) AS new_supplier_count,
  (SELECT COUNT(*) FROM quotations) AS quotation_rows;
