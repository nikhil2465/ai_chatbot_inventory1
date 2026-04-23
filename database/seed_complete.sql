-- ============================================================
-- StockSense AI — COMPLETE Seed Data (12-month historical)
-- Plywood & Building Materials Dealer, Bangalore
-- Run: USE stocksense_inventory; then execute this file
-- This replaces seed.sql with full historical data.
-- ============================================================

USE stocksense_inventory;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE quotations;
TRUNCATE TABLE demand_forecast;
TRUNCATE TABLE finance_monthly;
TRUNCATE TABLE freight_trips;
TRUNCATE TABLE freight_lanes;
TRUNCATE TABLE grn;
TRUNCATE TABLE po_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE order_items;
TRUNCATE TABLE invoices;
TRUNCATE TABLE customer_orders;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE stock_levels;
TRUNCATE TABLE customers;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE godowns;
TRUNCATE TABLE products;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. PRODUCTS (18 SKUs)
-- ============================================================
INSERT INTO products (product_id, sku_code, sku_name, brand, category, thickness_mm, size_ft, unit, buy_price, sell_price, reorder_level, abc_class) VALUES
(1,  'BWP-CENT-18-84',  '18mm BWP (8x4)',          'Century',  'BWP Plywood',  18.0, '8x4', 'sheet', 1680, 1920, 200, 'A'),
(2,  'BWP-CENT-12-84',  '12mm BWP (8x4)',           'Century',  'BWP Plywood',  12.0, '8x4', 'sheet', 1100, 1280, 300, 'A'),
(3,  'BWP-GRPL-9-84',   '9mm BWP (8x4)',            'Greenply', 'BWP Plywood',   9.0, '8x4', 'sheet',  820,  940, 180, 'A'),
(4,  'MR-GRPL-12-84',   '12mm MR Plain (8x4)',      'Greenply', 'MR Plywood',   12.0, '8x4', 'sheet',  780,  940, 250, 'A'),
(5,  'MR-GRPL-18-84',   '18mm MR Plain (8x4)',      'Greenply', 'MR Plywood',   18.0, '8x4', 'sheet',  920, 1080, 200, 'B'),
(6,  'MR-CENT-6-84',    '6mm MR Plain (8x4)',       'Century',  'MR Plywood',    6.0, '8x4', 'sheet',  480,  580, 150, 'B'),
(7,  'COM-GEN-19-84',   '19mm Commercial (8x4)',    'Generic',  'Commercial',   19.0, '8x4', 'sheet',  720,  920, 120, 'C'),
(8,  'COM-GEN-12-84',   '12mm Commercial (8x4)',    'Generic',  'Commercial',   12.0, '8x4', 'sheet',  560,  720, 100, 'C'),
(9,  'BWP-GRPL-6-84',   '6mm Gurjan BWP (8x4)',     'Greenply', 'BWP Plywood',   6.0, '8x4', 'sheet',  860, 1100, 100, 'B'),
(10, 'FLEX-GAUR-8-84',  '8mm Flexi BWP (8x4)',      'Gauri',    'Flexi',         8.0, '8x4', 'sheet',  680,  840,  80, 'C'),
(11, 'FLEX-GAUR-10-84', '10mm Flexi BWP (8x4)',     'Gauri',    'Flexi',        10.0, '8x4', 'sheet',  820,  980,  60, 'C'),
(12, 'LAM-GLAM-TEAK',   'Laminates Teak (8x4)',     'Greenlam', 'Laminate',      1.0, '8x4', 'sheet',  620,  760,  80, 'B'),
(13, 'LAM-GLAM-WLNT',   'Laminates Walnut (8x4)',   'Greenlam', 'Laminate',      1.0, '8x4', 'sheet',  640,  780,  60, 'B'),
(14, 'BWP-CENT-8-84',   '8mm BWP (8x4)',            'Century',  'BWP Plywood',   8.0, '8x4', 'sheet',  980, 1140, 120, 'A'),
(15, 'MR-GRPL-6-84',    '6mm MR Plywood (8x4)',     'Greenply', 'MR Plywood',    6.0, '8x4', 'sheet',  460,  560, 120, 'B'),
(16, 'BWP-CENT-25-84',  '25mm BWP (8x4)',            'Century', 'BWP Plywood',  25.0, '8x4', 'sheet', 2100, 2400, 100, 'B'),
(17, 'COM-GEN-6-84',    '6mm Commercial (8x4)',     'Generic',  'Commercial',    6.0, '8x4', 'sheet',  380,  480,  80, 'C'),
(18, 'LAM-GLAM-WHT',    'Laminates White (8x4)',    'Greenlam', 'Laminate',      1.0, '8x4', 'sheet',  580,  720,  60, 'B'),
-- ── HPL & Advanced Laminates ────────────────────────────────────────────────
(19, 'HPL-1MM-MATTE',   'HPL 1mm Matte (8x4)',      'Greenlam', 'High Pressure Laminate', 1.0, '8x4', 'sheet', 1080, 1300,  50, 'B'),
(20, 'HPL-COMPACT-6MM', 'HPL Compact 6mm (8x4)',    'Greenlam', 'Compact Laminate',       6.0, '8x4', 'sheet', 2980, 3600,  25, 'B'),
(21, 'ACRYLIC-LAM-84',  'Acrylic Laminate (8x4)',   'Generic',  'Acrylic',                1.0, '8x4', 'sheet', 1720, 2100,  20, 'B'),
-- ── Louvers & Aluminium Profiles ────────────────────────────────────────────
(22, 'LOUV-ALU-Z100-ANOD', 'Aluminium Z-Profile 100mm Anodized', 'Generic', 'Louvers', NULL, NULL, 'RM',  1720, 2100, 50, 'A'),
(23, 'LOUV-ALU-Z80-PC',    'Aluminium Z-Profile 80mm Powder Coated', 'Generic', 'Louvers', NULL, NULL, 'RM', 1350, 1680, 40, 'A'),
(24, 'LOUV-PVC-100',       'PVC Louver Blades 100mm',            'Generic', 'Louvers', NULL, NULL, 'RM',   390,  580, 80, 'B'),
(25, 'LOUV-OPS-MTR',       'Operable Louvre System (Motorised)', 'Generic', 'Operable Louvre System', NULL, NULL, 'SQM', 9200, 12000, 5, 'A');

-- ============================================================
-- 2. GODOWNS
-- ============================================================
INSERT INTO godowns (godown_id, godown_name, location, capacity_sheets) VALUES
(1, 'Main WH (HSR Layout)',       'HSR Layout, Bangalore',         2000),
(2, 'North Hub (Yeshwantpur)',    'Yeshwantpur, Bangalore',         1200),
(3, 'South Yard (Bommanahalli)', 'Bommanahalli, Bangalore',          800);

-- ============================================================
-- 3. STOCK LEVELS
-- ============================================================
INSERT INTO stock_levels (product_id, godown_id, quantity) VALUES
(1,  1, 85),  (2,  1, 120), (3,  1, 310), (4,  1, 210), (5,  1, 380),
(6,  1, 195), (7,  1, 28),  (8,  1, 42),  (9,  1, 186), (10, 1, 110),
(11, 1, 88),  (12, 1, 240), (13, 1, 180), (14, 1, 45),  (15, 1, 220),
(16, 1, 140), (17, 1, 18),  (18, 1, 160),
(1,  2, 40),  (2,  2, 80),  (3,  2, 120), (4,  2, 60),  (5,  2, 90), (12, 2, 80),
(1,  3, 15),  (3,  3, 60),  (4,  3, 40),  (14, 3, 20);

-- ============================================================
-- 4. SUPPLIERS
-- ============================================================
INSERT INTO suppliers (supplier_id, supplier_name, contact_person, phone, email, city, on_time_pct, avg_delay_days, lead_time_days, freight_per_sheet, price_vs_market, grn_match_rate, recommendation) VALUES
(1, 'Century Plyboards Ltd',   'Ramesh Kumar',  '9880001234', 'ramesh@centuryply.com', 'Bangalore', 96.2, 0.5,  6,  8.40, '-3% below market',  98.0, 'EXPAND'),
(2, 'Greenply Industries',     'Suresh Sharma', '9880005678', 'suresh@greenply.com',   'Bangalore', 89.5, 1.8,  8,  9.20, 'At market rate',    95.5, 'GOOD'),
(3, 'Gauri Laminates Pvt Ltd', 'Anjali Singh',  '9880009012', 'anjali@gaurilam.com',   'Mumbai',    68.3, 4.2, 14, 28.00, '+11% above market', 78.0, 'REDUCE'),
(4,  'Greenlam Industries',       'Vijay Nair',       '9880003456', 'vijay@greenlam.com',       'Delhi',       91.0, 1.2, 10,  6.50, '-1% below market',   96.0, 'GOOD'),
-- ── Additional Laminates & Plywood Suppliers ──────────────────────────────
(5,  'Kitply Industries',        'Sanjay Mehta',     '9871234501', 'sanjay@kitply.com',        'Kolkata',     71.0, 3.8,  8, 14.00, '-6% below market',   74.0, 'CAUTION'),
(6,  'Archidply Industries',     'Ravi Patel',       '9871234502', 'ravi@archidply.com',       'Bangalore',   68.0, 4.5, 10, 16.00, '-8% below market',   70.0, 'CAUTION'),
(7,  'Merino Industries',        'Deepak Gupta',     '9871234503', 'deepak@merino.com',        'Kolkata',     94.0, 0.8,  7, 18.00, '+6% above market',   96.0, 'GOOD'),
(8,  'Action Tesa',              'Kiran Shah',       '9871234504', 'kiran@actiontesa.com',     'Ahmedabad',   82.0, 1.5,  8, 20.00, '-4% below market',   88.0, 'GOOD'),
(9,  'Formica India',            'Prashant Joshi',   '9871234505', 'prashant@formica.com',     'Mumbai',      97.0, 0.3,  5, 16.00, '+12% above market',  98.0, 'PREFERRED'),
(10, 'Stylam Industries',        'Ankit Verma',      '9871234506', 'ankit@stylam.com',         'Panchkula',   79.0, 2.8, 10, 32.00, '-9% below market',   81.0, 'REVIEW'),
(11, 'Durian Industries',        'Rohan Das',        '9871234507', 'rohan@durian.com',         'Mumbai',      88.0, 1.1,  7, 18.00, 'At market rate',     91.0, 'GOOD'),
-- ── Louvers & Aluminium Profile Suppliers ────────────────────────────────
(12, 'Alufit Systems',           'Mahesh Iyer',      '9871234508', 'mahesh@alufit.com',        'Ahmedabad',   92.0, 1.0, 10, NULL, '+8% above market',    94.0, 'GOOD'),
(13, 'Supreme Profile India',    'Rajiv Bose',       '9871234509', 'rajiv@supremeprofile.com', 'Bangalore',   85.0, 1.8,  8, NULL, 'At market rate',      88.0, 'GOOD'),
(14, 'Alumax Profiles',          'Sunil Tiwari',     '9871234510', 'sunil@alumax.com',         'Surat',       78.0, 3.2, 12, NULL, '-4% below market',    80.0, 'REVIEW'),
(15, 'Jindal Aluminium',         'Vikram Jindal',    '9871234511', 'vikram@jindalalu.com',     'Delhi',       95.0, 0.5,  9, NULL, '+4% above market',    97.0, 'PREFERRED'),
(16, 'Aluline India',            'Neeraj Kapoor',    '9871234512', 'neeraj@aluline.com',       'Pune',        83.0, 1.9,  9, NULL, '-2% below market',    86.0, 'GOOD'),
(17, 'Coltors India',            'Farhan Qureshi',   '9871234513', 'farhan@coltors.com',       'Chennai',     80.0, 2.2,  6, NULL, '+2% above market',    82.0, 'GOOD'),
(18, 'Polycab India',            'Arun Pillai',      '9871234514', 'arun@polycab.com',         'Halol',       90.0, 0.9,  4, NULL, '+8% above market',    93.0, 'GOOD'),
(19, 'Technal India',            'Laurent Dubois',   '9871234515', 'laurent@technal.com',      'Mumbai',      96.0, 0.4, 18, NULL, '+14% above market',   98.0, 'PREFERRED'),
(20, 'YKK AP India',             'Hiroshi Tanaka',   '9871234516', 'hiroshi@ykk-ap.com',       'Bangalore',   98.0, 0.2, 25, NULL, '+28% above market',   99.0, 'PREFERRED');

-- ============================================================
-- 5. PURCHASE ORDERS
-- ============================================================
INSERT INTO purchase_orders (po_id, po_number, supplier_id, po_date, expected_date, received_date, status, total_value, notes) VALUES
(1, 'PO-2026-0421', 1, DATE_SUB(CURDATE(),INTERVAL 8 DAY),  DATE_SUB(CURDATE(),INTERVAL 2 DAY),  NULL,       'OVERDUE',  672000, 'Urgent — 18mm BWP critically low'),
(2, 'PO-2026-0418', 2, DATE_SUB(CURDATE(),INTERVAL 5 DAY),  DATE_ADD(CURDATE(),INTERVAL 3 DAY),  NULL,       'OPEN',     312000, '12mm MR Greenply restock'),
(3, 'PO-2026-0415', 1, DATE_SUB(CURDATE(),INTERVAL 12 DAY), DATE_SUB(CURDATE(),INTERVAL 4 DAY),  NULL,       'OVERDUE',  384000, '12mm BWP Century — CRITICAL'),
(4, 'PO-2026-0410', 4, DATE_SUB(CURDATE(),INTERVAL 15 DAY), DATE_SUB(CURDATE(),INTERVAL 5 DAY),  CURDATE(),  'RECEIVED', 198000, 'Laminates Teak & Walnut'),
(5, 'PO-2026-0388', 2, DATE_SUB(CURDATE(),INTERVAL 22 DAY), DATE_SUB(CURDATE(),INTERVAL 12 DAY), DATE_SUB(CURDATE(),INTERVAL 11 DAY), 'RECEIVED', 280000, '12mm MR + 18mm MR restocking'),
(6, 'PO-2026-0360', 1, DATE_SUB(CURDATE(),INTERVAL 35 DAY), DATE_SUB(CURDATE(),INTERVAL 25 DAY), DATE_SUB(CURDATE(),INTERVAL 24 DAY), 'RECEIVED', 504000, 'Monthly 18mm BWP order');

INSERT INTO po_items (po_id, product_id, qty_ordered, qty_received, unit_price, freight_per_sheet) VALUES
(1, 1, 300, 0,   1680, 8.40),
(1, 14, 120, 0,   980, 8.40),
(2, 4, 300, 0,    780, 9.20),
(2, 5, 100, 0,    920, 9.20),
(3, 2, 300, 0,   1100, 8.40),
(4, 12, 150, 150,  620, 6.50),
(4, 13, 120, 120,  640, 6.50),
(5, 4, 200, 200,   780, 9.20),
(5, 5, 100, 100,   920, 9.20),
(6, 1, 300, 300,  1680, 8.40);

-- ============================================================
-- 6. CUSTOMERS
-- ============================================================
INSERT INTO customers (customer_id, customer_name, segment, phone, email, credit_limit, credit_days, avg_discount_pct, avg_monthly_value, last_order_date, risk_status) VALUES
(1,  'Mehta Constructions',    'Contractor',    '9901112233', 'mehta@constr.com',    500000, 30,  2.0, 380000, DATE_SUB(CURDATE(),INTERVAL 2 DAY),  'LOW'),
(2,  'Sharma Constructions',   'Contractor',    '9902223344', 'sharma@constr.com',   400000, 45,  3.5, 320000, DATE_SUB(CURDATE(),INTERVAL 82 DAY), 'HIGH'),
(3,  'City Interiors Pvt Ltd', 'Interior Firm', '9903334455', 'city@interiors.com',  300000, 30,  5.0, 280000, DATE_SUB(CURDATE(),INTERVAL 5 DAY),  'LOW'),
(4,  'Patel Hardware Store',   'Retailer',      '9904445566', 'patel@hardware.com',  200000, 21,  1.5, 180000, DATE_SUB(CURDATE(),INTERVAL 15 DAY), 'MEDIUM'),
(5,  'Kumar Furniture Works',  'Carpenter',     '9905556677', 'kumar@furn.com',      100000, 15,  4.0, 120000, DATE_SUB(CURDATE(),INTERVAL 3 DAY),  'LOW'),
(6,  'Nair Builders',          'Contractor',    '9906667788', 'nair@build.com',      350000, 30,  2.5, 250000, DATE_SUB(CURDATE(),INTERVAL 48 DAY), 'MEDIUM'),
(7,  'Sri Ram Traders',        'Retailer',      '9907778899', 'sriram@trade.com',    150000, 21,  1.0, 110000, DATE_SUB(CURDATE(),INTERVAL 10 DAY), 'LOW'),
(8,  'Decor Plus Interiors',   'Interior Firm', '9908889900', 'decor@plus.com',      250000, 30,  6.0, 200000, DATE_SUB(CURDATE(),INTERVAL 20 DAY), 'LOW'),
(9,  'Excel Plywoods Retail',  'Retailer',      '9909990011', 'excel@ply.com',       120000, 14,  1.5, 90000,  DATE_SUB(CURDATE(),INTERVAL 60 DAY), 'HIGH'),
(10, 'Royal Furniture Makers', 'Carpenter',     '9900001122', 'royal@furn.com',       80000, 15,  3.0, 70000,  DATE_SUB(CURDATE(),INTERVAL 7 DAY),  'LOW');

-- ============================================================
-- 7. CUSTOMER ORDERS (current + 30-day history)
-- ============================================================
INSERT INTO customer_orders (order_id, order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
-- Today / Active
(1,  'ORD-2026-0892', 1, CURDATE(),                                NULL,                                   'PENDING',    384000, 2.0,  30,  '18mm BWP out of stock — awaiting PO-2026-0421'),
(2,  'ORD-2026-0891', 5, CURDATE(),                                NULL,                                   'PENDING',     86400, 4.0,   0,  NULL),
(3,  'ORD-2026-0890', 3, DATE_SUB(CURDATE(),INTERVAL  1 DAY),      CURDATE(),                              'DISPATCHED', 192000, 5.0,   0,  NULL),
(4,  'ORD-2026-0889', 7, DATE_SUB(CURDATE(),INTERVAL  1 DAY),      CURDATE(),                              'DISPATCHED',  94600, 1.0,   0,  NULL),
(5,  'ORD-2026-0888', 2, DATE_SUB(CURDATE(),INTERVAL  5 DAY),      DATE_SUB(CURDATE(),INTERVAL  4 DAY),    'DELIVERED',  320000, 3.5,   0,  NULL),
(6,  'ORD-2026-0887', 4, DATE_SUB(CURDATE(),INTERVAL  3 DAY),      NULL,                                   'PENDING',    141200, 1.5,  12,  'Driver unavailable — rescheduled'),
-- Recent history
(7,  'ORD-2026-0881', 8, DATE_SUB(CURDATE(),INTERVAL  6 DAY),      DATE_SUB(CURDATE(),INTERVAL  5 DAY),    'DELIVERED',  212000, 6.0,   0,  NULL),
(8,  'ORD-2026-0874', 10,DATE_SUB(CURDATE(),INTERVAL  7 DAY),      DATE_SUB(CURDATE(),INTERVAL  6 DAY),    'DELIVERED',   86400, 3.0,   0,  NULL),
(9,  'ORD-2026-0868', 1, DATE_SUB(CURDATE(),INTERVAL  8 DAY),      DATE_SUB(CURDATE(),INTERVAL  7 DAY),    'DELIVERED',  451200, 2.0,   0,  NULL),
(10, 'ORD-2026-0862', 3, DATE_SUB(CURDATE(),INTERVAL  9 DAY),      DATE_SUB(CURDATE(),INTERVAL  8 DAY),    'DELIVERED',  164400, 5.0,   6,  'Stock consolidation delay'),
(11, 'ORD-2026-0855', 5, DATE_SUB(CURDATE(),INTERVAL 10 DAY),      DATE_SUB(CURDATE(),INTERVAL  9 DAY),    'DELIVERED',   72000, 4.0,   0,  NULL),
(12, 'ORD-2026-0848', 7, DATE_SUB(CURDATE(),INTERVAL 11 DAY),      DATE_SUB(CURDATE(),INTERVAL 10 DAY),    'DELIVERED',  108240, 1.0,   0,  NULL),
(13, 'ORD-2026-0841', 4, DATE_SUB(CURDATE(),INTERVAL 12 DAY),      DATE_SUB(CURDATE(),INTERVAL 11 DAY),    'DELIVERED',  156800, 1.5,   0,  NULL),
(14, 'ORD-2026-0834', 8, DATE_SUB(CURDATE(),INTERVAL 14 DAY),      DATE_SUB(CURDATE(),INTERVAL 13 DAY),    'DELIVERED',  198400, 6.0,   0,  NULL),
(15, 'ORD-2026-0820', 1, DATE_SUB(CURDATE(),INTERVAL 16 DAY),      DATE_SUB(CURDATE(),INTERVAL 15 DAY),    'DELIVERED',  422400, 2.0,  18,  'Partial stock — 18mm BWP low'),
(16, 'ORD-2026-0806', 10,DATE_SUB(CURDATE(),INTERVAL 18 DAY),      DATE_SUB(CURDATE(),INTERVAL 17 DAY),    'DELIVERED',   64800, 3.0,   0,  NULL),
(17, 'ORD-2026-0792', 3, DATE_SUB(CURDATE(),INTERVAL 20 DAY),      DATE_SUB(CURDATE(),INTERVAL 19 DAY),    'DELIVERED',  243200, 5.0,   0,  NULL),
(18, 'ORD-2026-0778', 7, DATE_SUB(CURDATE(),INTERVAL 22 DAY),      DATE_SUB(CURDATE(),INTERVAL 21 DAY),    'DELIVERED',   82400, 1.0,   0,  NULL),
(19, 'ORD-2026-0764', 4, DATE_SUB(CURDATE(),INTERVAL 24 DAY),      DATE_SUB(CURDATE(),INTERVAL 23 DAY),    'DELIVERED',  124000, 1.5,   0,  NULL),
(20, 'ORD-2026-0750', 1, DATE_SUB(CURDATE(),INTERVAL 26 DAY),      DATE_SUB(CURDATE(),INTERVAL 25 DAY),    'DELIVERED',  364800, 2.0,   0,  NULL);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount_pct) VALUES
(1,  1,  200, 1920, 2.0),
(2,  4,  60,   940, 4.0), (2,  12, 50,  760, 4.0),
(3,  5,  100, 1080, 5.0), (3,  3,  80,  940, 5.0),
(4,  12, 70,   760, 1.0), (4,  15, 60,  560, 1.0),
(5,  1,  100, 1920, 3.5), (5,  2,  100, 1280, 3.5),
(6,  4,  80,   940, 1.5), (6,  5,  60, 1080, 1.5),
(7,  12, 120,  760, 6.0), (7,  13, 80,  780, 6.0),
(8,  4,  60,   940, 3.0), (8,  6,  60,  580, 3.0),
(9,  1,  150, 1920, 2.0), (9,  2,  80, 1280, 2.0), (9, 14, 60, 1140, 2.0),
(10, 3,  100,  940, 5.0), (10, 5,  60, 1080, 5.0),
(11, 4,  50,   940, 4.0), (11, 15, 40,  560, 4.0),
(12, 12, 80,   760, 1.0), (12, 13, 60,  780, 1.0),
(13, 4,  100,  940, 1.5), (13, 6,  80,  580, 1.5),
(14, 3,  120,  940, 6.0), (14, 5,  80, 1080, 6.0),
(15, 1,  140, 1920, 2.0), (15, 2,  100, 1280, 2.0), (15, 3, 60, 940, 2.0),
(16, 12, 60,   760, 3.0), (16, 18, 40,  720, 3.0),
(17, 1,  80,  1920, 5.0), (17, 4, 100,  940, 5.0), (17, 5, 60, 1080, 5.0),
(18, 12, 70,   760, 1.0), (18, 15, 50,  560, 1.0),
(19, 4,  80,   940, 1.5), (19, 5,  50, 1080, 1.5),
(20, 1,  120, 1920, 2.0), (20, 2,  100, 1280, 2.0), (20, 3, 60, 940, 2.0);

-- ============================================================
-- 8. INVOICES
-- ============================================================
INSERT INTO invoices (invoice_number, customer_id, order_id, invoice_date, due_date, amount, paid_amount, status) VALUES
('INV-2026-1201', 2, 5,    DATE_SUB(CURDATE(),INTERVAL 78 DAY), DATE_SUB(CURDATE(),INTERVAL 48 DAY), 320000, 0,      'OVERDUE'),
('INV-2026-1180', 6, NULL, DATE_SUB(CURDATE(),INTERVAL 52 DAY), DATE_SUB(CURDATE(),INTERVAL 22 DAY), 220000, 100000, 'PARTIAL'),
('INV-2026-1155', 9, NULL, DATE_SUB(CURDATE(),INTERVAL 65 DAY), DATE_SUB(CURDATE(),INTERVAL 44 DAY),  82000, 0,      'OVERDUE'),
('INV-2026-1290', 1, 1,    DATE_SUB(CURDATE(),INTERVAL 2 DAY),  DATE_ADD(CURDATE(),INTERVAL 28 DAY), 384000, 0,      'UNPAID'),
('INV-2026-1288', 3, 3,    DATE_SUB(CURDATE(),INTERVAL 1 DAY),  DATE_ADD(CURDATE(),INTERVAL 29 DAY), 192000, 192000, 'PAID'),
('INV-2026-1265', 4, 6,    DATE_SUB(CURDATE(),INTERVAL 3 DAY),  DATE_ADD(CURDATE(),INTERVAL 18 DAY), 141200, 0,      'UNPAID'),
('INV-2026-1240', 8, 7,    DATE_SUB(CURDATE(),INTERVAL 6 DAY),  DATE_ADD(CURDATE(),INTERVAL 24 DAY), 212000, 212000, 'PAID'),
('INV-2026-1220', 1, 9,    DATE_SUB(CURDATE(),INTERVAL 8 DAY),  DATE_ADD(CURDATE(),INTERVAL 22 DAY), 451200, 451200, 'PAID'),
('INV-2026-1210', 3, 10,   DATE_SUB(CURDATE(),INTERVAL 9 DAY),  DATE_ADD(CURDATE(),INTERVAL 21 DAY), 164400, 164400, 'PAID');

-- ============================================================
-- 9. STOCK MOVEMENTS (30-day history for charts)
-- ============================================================
INSERT INTO stock_movements (product_id, godown_id, movement_type, quantity, reference_no, note, moved_at) VALUES
-- Dead stock (last movement 90+ days ago)
(7,  1, 'OUT',  4, 'ORD-2025-0344', '19mm Commercial — last sale',  DATE_SUB(CURDATE(),INTERVAL 95 DAY)),
(9,  1, 'OUT', 10, 'ORD-2025-0298', '6mm Gurjan BWP — last sale',   DATE_SUB(CURDATE(),INTERVAL 120 DAY)),
(8,  1, 'OUT',  6, 'ORD-2025-0312', '12mm Commercial — last sale',  DATE_SUB(CURDATE(),INTERVAL 100 DAY)),
-- Historical PO receipts
(1,  1, 'IN',  300, 'PO-2026-0360', 'Century 18mm BWP restock',     DATE_SUB(CURDATE(),INTERVAL 24 DAY)),
(4,  1, 'IN',  200, 'PO-2026-0388', 'Greenply 12mm MR restock',     DATE_SUB(CURDATE(),INTERVAL 11 DAY)),
(5,  1, 'IN',  100, 'PO-2026-0388', 'Greenply 18mm MR restock',     DATE_SUB(CURDATE(),INTERVAL 11 DAY)),
(12, 1, 'IN',  150, 'PO-2026-0410', 'Greenlam Laminates Teak',      DATE_SUB(CURDATE(),INTERVAL 2 DAY)),
(13, 1, 'IN',  120, 'PO-2026-0410', 'Greenlam Laminates Walnut',    DATE_SUB(CURDATE(),INTERVAL 2 DAY)),
-- Daily OUT movements (last 26 days — top movers)
(1,  1, 'OUT', 120, 'ORD-2026-0750', 'Mehta Constructions',         DATE_SUB(CURDATE(),INTERVAL 26 DAY)),
(2,  1, 'OUT', 100, 'ORD-2026-0750', 'Mehta Constructions',         DATE_SUB(CURDATE(),INTERVAL 26 DAY)),
(3,  1, 'OUT',  60, 'ORD-2026-0750', 'Mehta batch',                 DATE_SUB(CURDATE(),INTERVAL 26 DAY)),
(1,  1, 'OUT', 140, 'ORD-2026-0764', 'Patel Hardware',              DATE_SUB(CURDATE(),INTERVAL 24 DAY)),
(5,  1, 'OUT',  50, 'ORD-2026-0764', 'Patel Hardware',              DATE_SUB(CURDATE(),INTERVAL 24 DAY)),
(3,  1, 'OUT',  80, 'ORD-2026-0778', 'Sri Ram Traders',             DATE_SUB(CURDATE(),INTERVAL 22 DAY)),
(12, 1, 'OUT',  70, 'ORD-2026-0778', 'Sri Ram Traders',             DATE_SUB(CURDATE(),INTERVAL 22 DAY)),
(1,  1, 'OUT',  80, 'ORD-2026-0792', 'City Interiors',              DATE_SUB(CURDATE(),INTERVAL 20 DAY)),
(4,  1, 'OUT', 100, 'ORD-2026-0792', 'City Interiors',              DATE_SUB(CURDATE(),INTERVAL 20 DAY)),
(5,  1, 'OUT',  60, 'ORD-2026-0792', 'City Interiors',              DATE_SUB(CURDATE(),INTERVAL 20 DAY)),
(12, 1, 'OUT',  60, 'ORD-2026-0806', 'Royal Furniture',             DATE_SUB(CURDATE(),INTERVAL 18 DAY)),
(18, 1, 'OUT',  40, 'ORD-2026-0806', 'Royal Furniture',             DATE_SUB(CURDATE(),INTERVAL 18 DAY)),
(1,  1, 'OUT', 150, 'ORD-2026-0820', 'Mehta Constructions bulk',    DATE_SUB(CURDATE(),INTERVAL 15 DAY)),
(2,  1, 'OUT', 100, 'ORD-2026-0820', 'Mehta batch',                 DATE_SUB(CURDATE(),INTERVAL 15 DAY)),
(3,  1, 'OUT',  60, 'ORD-2026-0820', 'Mehta batch',                 DATE_SUB(CURDATE(),INTERVAL 15 DAY)),
(4,  1, 'OUT', 100, 'ORD-2026-0834', 'Patel Hardware',              DATE_SUB(CURDATE(),INTERVAL 14 DAY)),
(5,  1, 'OUT',  80, 'ORD-2026-0834', 'Patel Hardware',              DATE_SUB(CURDATE(),INTERVAL 14 DAY)),
(3,  1, 'OUT', 120, 'ORD-2026-0841', 'Decor Plus Interiors',        DATE_SUB(CURDATE(),INTERVAL 12 DAY)),
(5,  1, 'OUT',  80, 'ORD-2026-0841', 'Decor Plus',                  DATE_SUB(CURDATE(),INTERVAL 12 DAY)),
(4,  1, 'OUT',  60, 'ORD-2026-0848', 'Sri Ram Traders',             DATE_SUB(CURDATE(),INTERVAL 11 DAY)),
(6,  1, 'OUT',  60, 'ORD-2026-0848', 'Sri Ram Traders',             DATE_SUB(CURDATE(),INTERVAL 11 DAY)),
(4,  1, 'OUT',  50, 'ORD-2026-0855', 'Kumar Furniture',             DATE_SUB(CURDATE(),INTERVAL 10 DAY)),
(15, 1, 'OUT',  40, 'ORD-2026-0855', 'Kumar Furniture',             DATE_SUB(CURDATE(),INTERVAL 10 DAY)),
(1,  1, 'OUT', 150, 'ORD-2026-0862', 'City Interiors',              DATE_SUB(CURDATE(),INTERVAL  9 DAY)),
(2,  1, 'OUT',  80, 'ORD-2026-0862', 'City Interiors',              DATE_SUB(CURDATE(),INTERVAL  9 DAY)),
(14, 1, 'OUT',  60, 'ORD-2026-0868', '8mm BWP dispatch',            DATE_SUB(CURDATE(),INTERVAL  7 DAY)),
(10, 1, 'OUT',  14, 'ORD-2026-0868', '8mm Flexi dispatch',          DATE_SUB(CURDATE(),INTERVAL  7 DAY)),
(10, 1, 'ADJUSTMENT', -5, 'ADJ-2026-04', 'Water damage — godown 1', DATE_SUB(CURDATE(),INTERVAL  6 DAY)),
(4,  1, 'OUT',  60, 'ORD-2026-0874', 'Royal Furniture',             DATE_SUB(CURDATE(),INTERVAL  7 DAY)),
(6,  1, 'OUT',  60, 'ORD-2026-0874', 'Royal Furniture',             DATE_SUB(CURDATE(),INTERVAL  7 DAY)),
(12, 1, 'OUT', 120, 'ORD-2026-0881', 'Decor Plus Interiors',        DATE_SUB(CURDATE(),INTERVAL  6 DAY)),
(13, 1, 'OUT',  80, 'ORD-2026-0881', 'Decor Plus',                  DATE_SUB(CURDATE(),INTERVAL  6 DAY)),
(1,  1, 'OUT', 100, 'ORD-2026-0888', 'Sharma Constructions',        DATE_SUB(CURDATE(),INTERVAL  5 DAY)),
(2,  1, 'OUT', 100, 'ORD-2026-0888', 'Sharma Constructions',        DATE_SUB(CURDATE(),INTERVAL  5 DAY)),
(3,  1, 'OUT',  80, 'ORD-2026-0890', 'City Interiors dispatch',     DATE_SUB(CURDATE(),INTERVAL  1 DAY)),
(12, 1, 'OUT',  70, 'ORD-2026-0889', 'Sri Ram Traders',             DATE_SUB(CURDATE(),INTERVAL  1 DAY)),
(4,  1, 'OUT',  60, 'ORD-2026-0891', 'Kumar Furniture',             CURDATE()),
(12, 1, 'OUT',  50, 'ORD-2026-0891', 'Kumar Furniture laminates',   CURDATE());

-- ============================================================
-- 10. GRN (Goods Receipt Notes — history)
-- ============================================================
INSERT INTO grn (grn_number, po_id, supplier_id, received_date, invoice_value, grn_value, match_status, discrepancy_amt, notes) VALUES
('GRN-2026-0088', 4, 4, DATE_SUB(CURDATE(),INTERVAL  2 DAY), 198000, 198000, 'MATCH',    0,     'Greenlam laminates — perfect match'),
('GRN-2026-0074', NULL, 3, DATE_SUB(CURDATE(),INTERVAL 25 DAY), 112000, 98000, 'MISMATCH', 14000, 'Gauri — 50 sheets short delivered'),
('GRN-2026-0079', 5, 2, DATE_SUB(CURDATE(),INTERVAL 11 DAY), 280000, 272000, 'MISMATCH',  8000, 'Greenply — 10 sheets grade variance'),
('GRN-2026-0082', 6, 1, DATE_SUB(CURDATE(),INTERVAL 24 DAY), 504000, 504000, 'MATCH',     0,    'Century 18mm BWP — full receipt'),
('GRN-2026-0062', NULL, 3, DATE_SUB(CURDATE(),INTERVAL 42 DAY), 86000, 72000, 'MISMATCH', 14000, 'Gauri — wrong grade delivered, 20 sheets returned');

-- ============================================================
-- 11. FREIGHT LANES
-- ============================================================
INSERT INTO freight_lanes (lane_id, lane_name, zone, distance_km, cost_per_sheet, avg_fill_pct, status) VALUES
(1, 'HSR-Whitefield',     'East Bangalore',    18, 14.50, 82.0, 'BEST'),
(2, 'HSR-Koramangala',    'Central Bangalore',  8,  8.40, 91.0, 'BEST'),
(3, 'HSR-Yeshwantpur',    'North Bangalore',   22, 17.00, 65.0, 'OK'),
(4, 'HSR-BTM',            'South Bangalore',   10, 19.00, 58.0, 'HIGH'),
(5, 'HSR-Electronic City','Far South',         34, 24.00, 54.0, 'WORST');

INSERT INTO freight_trips (lane_id, trip_date, vehicle_no, sheets_loaded, capacity_sheets, cost) VALUES
(1, DATE_SUB(CURDATE(),INTERVAL  1 DAY), 'KA01AB1234', 164, 200, 2378),
(2, DATE_SUB(CURDATE(),INTERVAL  1 DAY), 'KA01CD5678', 182, 200, 1529),
(3, DATE_SUB(CURDATE(),INTERVAL  2 DAY), 'KA01EF9012', 130, 200, 2210),
(4, CURDATE(),                           'KA01GH3456', 116, 200, 2204),
(5, DATE_SUB(CURDATE(),INTERVAL  3 DAY), 'KA01IJ7890', 108, 200, 2592),
(1, DATE_SUB(CURDATE(),INTERVAL  4 DAY), 'KA01AB1234', 170, 200, 2465),
(2, DATE_SUB(CURDATE(),INTERVAL  4 DAY), 'KA01CD5678', 178, 200, 1496),
(3, DATE_SUB(CURDATE(),INTERVAL  5 DAY), 'KA01EF9012', 124, 200, 2108),
(1, DATE_SUB(CURDATE(),INTERVAL  7 DAY), 'KA01AB1234', 158, 200, 2291),
(2, DATE_SUB(CURDATE(),INTERVAL  7 DAY), 'KA01CD5678', 186, 200, 1563),
(4, DATE_SUB(CURDATE(),INTERVAL  8 DAY), 'KA01GH3456', 120, 200, 2280),
(5, DATE_SUB(CURDATE(),INTERVAL  9 DAY), 'KA01IJ7890', 102, 200, 2448),
(1, DATE_SUB(CURDATE(),INTERVAL 11 DAY), 'KA01AB1234', 168, 200, 2436),
(2, DATE_SUB(CURDATE(),INTERVAL 11 DAY), 'KA01CD5678', 190, 200, 1596),
(3, DATE_SUB(CURDATE(),INTERVAL 12 DAY), 'KA01EF9012', 128, 200, 2176);

-- ============================================================
-- 12. FINANCE MONTHLY — 13 MONTHS HISTORICAL
-- April 2025 through April 2026
-- ============================================================
INSERT INTO finance_monthly (month_year, revenue, gross_profit, gross_margin_pct,
    gst_output, gst_itc, gst_net_payable,
    working_capital_days, dso_days, dio_days, dpo_days,
    outstanding_receivables, dead_stock_value, returns_value, notes) VALUES
-- Apr 2025
('2025-04-01', 1820000, 382200, 21.0, 327600, 262800, 64800, 52, 38, 24, 10, 980000,  620000, 68000, 'Pre-summer slowdown. Demand stable. Festive season prep needed.'),
-- May 2025
('2025-05-01', 1960000, 421400, 21.5, 352800, 283200, 69600, 50, 36, 22,  9, 1060000, 650000, 72000, 'Construction activity picking up. 18mm BWP in high demand.'),
-- Jun 2025
('2025-06-01', 1780000, 373800, 21.0, 320400, 256800, 63600, 54, 40, 24, 10, 1120000, 580000, 58000, 'Monsoon onset. Construction slows. Interior projects keep revenue stable.'),
-- Jul 2025
('2025-07-01', 1640000, 344400, 21.0, 295200, 237600, 57600, 58, 44, 26, 12, 1180000, 520000, 46000, 'Peak monsoon. Outdoor construction halted. Interior + laminates keep cash flowing.'),
-- Aug 2025
('2025-08-01', 1720000, 361200, 21.0, 309600, 248000, 61600, 56, 42, 25, 11, 1140000, 560000, 52000, 'Monsoon easing. Pre-Onam orders from Kerala contractors.'),
-- Sep 2025
('2025-09-01', 2140000, 470800, 22.0, 385200, 308000, 77200, 50, 36, 22,  8, 1050000, 540000, 62000, 'Pre-festive stocking surge. BWP demand up 18%. 12mm MR strong.'),
-- Oct 2025 (Diwali)
('2025-10-01', 2680000, 616400, 23.0, 482400, 384000, 98400, 46, 32, 20,  6, 890000,  480000, 74000, 'Diwali construction boom. Best month of H1. 18mm BWP sold out twice. Raised prices 3%.'),
-- Nov 2025 (peak)
('2025-11-01', 2820000, 648600, 23.0, 507600, 406400, 101200, 44, 30, 20,  6, 840000, 460000, 68000, 'Post-Diwali rush continues. Housing projects closing. Century BWP supply tight.'),
-- Dec 2025
('2025-12-01', 2460000, 566800, 23.0, 442800, 355200, 87600, 48, 34, 22,  8, 920000,  500000, 64000, 'Year-end project completions. Interior contractors active. Good month.'),
-- Jan 2026
('2026-01-01', 2180000, 479600, 22.0, 392400, 313600, 78800, 50, 36, 22,  9, 1020000, 580000, 58000, 'January slowdown. New project cycle starting. Focus on clearing dead stock.'),
-- Feb 2026
('2026-02-01', 2340000, 514800, 22.0, 421200, 336000, 85200, 49, 35, 22,  8, 1100000, 640000, 62000, 'Wedding season construction active. Laminates surge.'),
-- Mar 2026
('2026-03-01', 2580000, 580500, 22.5, 464400, 372000, 92400, 48, 34, 22,  8, 1240000, 720000, 72000, 'Financial year closing rush. Large project completions. Stock clearance drive.'),
-- Apr 2026 (current month — partial)
('2026-04-01', 2840000, 636000, 22.4, 511200, 428000, 83200, 48, 34, 22,  8, 1280000, 780000, 82000,
 'GSTR-3B due 20th. Hidden margin kill: Gauri Flexi freight Rs.28/sheet vs Century Rs.8.4/sheet');

-- ============================================================
-- 13. DEMAND FORECAST (current + 30/60/90 day horizon)
-- ============================================================
INSERT INTO demand_forecast (product_id, forecast_month, forecast_qty, actual_qty, demand_signal, notes) VALUES
-- 30-day (next month)
(1,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  1 MONTH), '%Y-%m-01'), 596, NULL, 'SURGE +24%',     'Festival season uplift — summer construction peak'),
(2,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  1 MONTH), '%Y-%m-01'), 432, NULL, 'GROWING +13.7%', 'New housing project in Whitefield driving demand'),
(3,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  1 MONTH), '%Y-%m-01'), 448, NULL, 'STABLE +6.7%',   'Consistent demand from interior contractors'),
(4,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  1 MONTH), '%Y-%m-01'), 298, NULL, 'DECLINING -6.9%','Shift to BWP grades, MR demand softening'),
(5,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  1 MONTH), '%Y-%m-01'), 220, NULL, 'STABLE +2.1%',   'Steady contractor demand'),
(12, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  1 MONTH), '%Y-%m-01'), 380, NULL, 'GROWING +18.2%', 'Interior design season boosting laminates'),
(14, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  1 MONTH), '%Y-%m-01'), 180, NULL, 'SURGE +31.2%',   'Mehta Constructions bulk order confirmed'),
-- 60-day
(1,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  2 MONTH), '%Y-%m-01'), 680, NULL, 'GROWING',        'Q2 peak — budget clearance construction projects'),
(2,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  2 MONTH), '%Y-%m-01'), 498, NULL, 'GROWING',        'Whitefield project Phase 2 expected'),
(3,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  2 MONTH), '%Y-%m-01'), 436, NULL, 'STABLE',         'Baseline demand'),
(4,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  2 MONTH), '%Y-%m-01'), 274, NULL, 'DECLINING',      'Trend continues'),
(12, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  2 MONTH), '%Y-%m-01'), 420, NULL, 'GROWING',        'Monsoon prep interior projects'),
(14, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  2 MONTH), '%Y-%m-01'), 210, NULL, 'GROWING',        '8mm BWP in high demand for furniture'),
-- 90-day
(1,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  3 MONTH), '%Y-%m-01'), 712, NULL, 'SURGE',          'Pre-monsoon last push — stocking by all contractors'),
(2,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  3 MONTH), '%Y-%m-01'), 524, NULL, 'GROWING',        '12mm BWP gaining vs 12mm MR'),
(3,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  3 MONTH), '%Y-%m-01'), 380, NULL, 'STABLE',         'Monsoon onset may soften'),
(4,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  3 MONTH), '%Y-%m-01'), 250, NULL, 'DECLINING',      'Strong downward trend'),
(12, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL  3 MONTH), '%Y-%m-01'), 460, NULL, 'GROWING',        'Interior projects peak during monsoon');

-- ============================================================
-- 14. HISTORICAL CUSTOMER ORDERS — 12-Month Revenue Trail
--     Months: Apr 2025 – Mar 2026 (to power Sales chart)
--     Values aligned with finance_monthly for consistent charts
-- ============================================================

-- April 2025 (target ₹18.2L)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-0201', 1, '2025-04-04', '2025-04-05', 'DELIVERED', 384000, 2.0, 0, NULL),
('ORD-2025-0202', 3, '2025-04-07', '2025-04-08', 'DELIVERED', 198000, 5.0, 0, NULL),
('ORD-2025-0203', 4, '2025-04-09', '2025-04-10', 'DELIVERED', 156000, 1.5, 0, NULL),
('ORD-2025-0204', 8, '2025-04-11', '2025-04-12', 'DELIVERED', 212000, 6.0, 0, NULL),
('ORD-2025-0205', 6, '2025-04-14', '2025-04-15', 'DELIVERED', 248000, 2.5, 0, NULL),
('ORD-2025-0206', 7, '2025-04-16', '2025-04-17', 'DELIVERED',  96000, 1.0, 0, NULL),
('ORD-2025-0207', 5, '2025-04-18', '2025-04-19', 'DELIVERED',  72000, 4.0, 0, NULL),
('ORD-2025-0208', 10,'2025-04-21', '2025-04-22', 'DELIVERED',  64000, 3.0, 0, NULL),
('ORD-2025-0209', 1, '2025-04-23', '2025-04-24', 'DELIVERED', 320000, 2.0, 0, NULL),
('ORD-2025-0210', 4, '2025-04-25', '2025-04-26', 'DELIVERED', 170000, 1.5, 0, NULL),
('ORD-2025-0211', 3, '2025-04-28', '2025-04-29', 'DELIVERED', 280000, 5.0, 0, NULL);

-- May 2025 (target ₹19.6L)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-0301', 1, '2025-05-03', '2025-05-04', 'DELIVERED', 420000, 2.0, 0, NULL),
('ORD-2025-0302', 8, '2025-05-06', '2025-05-07', 'DELIVERED', 224000, 6.0, 0, NULL),
('ORD-2025-0303', 3, '2025-05-09', '2025-05-10', 'DELIVERED', 186000, 5.0, 0, NULL),
('ORD-2025-0304', 6, '2025-05-12', '2025-05-13', 'DELIVERED', 264000, 2.5, 0, NULL),
('ORD-2025-0305', 4, '2025-05-14', '2025-05-15', 'DELIVERED', 148000, 1.5, 0, NULL),
('ORD-2025-0306', 7, '2025-05-17', '2025-05-18', 'DELIVERED', 108000, 1.0, 0, NULL),
('ORD-2025-0307', 5, '2025-05-19', '2025-05-20', 'DELIVERED',  84000, 4.0, 0, NULL),
('ORD-2025-0308', 10,'2025-05-21', '2025-05-22', 'DELIVERED',  72000, 3.0, 0, NULL),
('ORD-2025-0309', 1, '2025-05-24', '2025-05-25', 'DELIVERED', 360000, 2.0, 0, NULL),
('ORD-2025-0310', 3, '2025-05-27', '2025-05-28', 'DELIVERED', 134000, 5.0, 0, NULL);

-- June 2025 (target ₹17.8L — monsoon onset, slightly slower)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-0401', 1, '2025-06-03', '2025-06-04', 'DELIVERED', 348000, 2.0, 0, NULL),
('ORD-2025-0402', 8, '2025-06-06', '2025-06-07', 'DELIVERED', 198000, 6.0, 0, NULL),
('ORD-2025-0403', 3, '2025-06-10', '2025-06-11', 'DELIVERED', 172000, 5.0, 0, NULL),
('ORD-2025-0404', 4, '2025-06-13', '2025-06-14', 'DELIVERED', 142000, 1.5, 0, NULL),
('ORD-2025-0405', 6, '2025-06-17', '2025-06-18', 'DELIVERED', 218000, 2.5, 8, 'Monsoon road delay'),
('ORD-2025-0406', 5, '2025-06-20', '2025-06-21', 'DELIVERED',  76000, 4.0, 0, NULL),
('ORD-2025-0407', 7, '2025-06-23', '2025-06-24', 'DELIVERED',  96000, 1.0, 0, NULL),
('ORD-2025-0408', 1, '2025-06-26', '2025-06-27', 'DELIVERED', 328000, 2.0, 0, NULL),
('ORD-2025-0409', 10,'2025-06-28', '2025-06-29', 'DELIVERED', 202000, 3.0, 0, NULL);

-- July 2025 (target ₹16.4L — peak monsoon, slowest month)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-0501', 1, '2025-07-02', '2025-07-03', 'DELIVERED', 298000, 2.0, 0, NULL),
('ORD-2025-0502', 3, '2025-07-07', '2025-07-08', 'DELIVERED', 168000, 5.0, 4, 'Heavy rain delay'),
('ORD-2025-0503', 4, '2025-07-10', '2025-07-11', 'DELIVERED', 126000, 1.5, 0, NULL),
('ORD-2025-0504', 8, '2025-07-14', '2025-07-15', 'DELIVERED', 186000, 6.0, 6, 'Flooded road — Koramangala'),
('ORD-2025-0505', 6, '2025-07-18', '2025-07-20', 'DELIVERED', 198000, 2.5, 12, 'Monsoon logistics delay'),
('ORD-2025-0506', 5, '2025-07-22', '2025-07-23', 'DELIVERED',  64000, 4.0, 0, NULL),
('ORD-2025-0507', 7, '2025-07-25', '2025-07-26', 'DELIVERED',  88000, 1.0, 0, NULL),
('ORD-2025-0508', 1, '2025-07-28', '2025-07-29', 'DELIVERED', 272000, 2.0, 0, NULL),
('ORD-2025-0509', 10,'2025-07-30', '2025-07-31', 'DELIVERED', 200000, 3.0, 0, NULL);

-- August 2025 (target ₹17.2L — monsoon easing, Onam prep)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-0601', 1, '2025-08-04', '2025-08-05', 'DELIVERED', 342000, 2.0, 0, NULL),
('ORD-2025-0602', 3, '2025-08-07', '2025-08-08', 'DELIVERED', 182000, 5.0, 0, NULL),
('ORD-2025-0603', 6, '2025-08-11', '2025-08-12', 'DELIVERED', 224000, 2.5, 0, NULL),
('ORD-2025-0604', 4, '2025-08-14', '2025-08-15', 'DELIVERED', 136000, 1.5, 0, NULL),
('ORD-2025-0605', 8, '2025-08-18', '2025-08-19', 'DELIVERED', 196000, 6.0, 0, NULL),
('ORD-2025-0606', 7, '2025-08-21', '2025-08-22', 'DELIVERED',  92000, 1.0, 0, NULL),
('ORD-2025-0607', 5, '2025-08-25', '2025-08-26', 'DELIVERED',  76000, 4.0, 0, NULL),
('ORD-2025-0608', 1, '2025-08-27', '2025-08-28', 'DELIVERED', 312000, 2.0, 0, NULL),
('ORD-2025-0609', 10,'2025-08-29', '2025-08-30', 'DELIVERED', 160000, 3.0, 0, NULL);

-- September 2025 (target ₹21.4L — pre-festive surge)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-0701', 1, '2025-09-02', '2025-09-03', 'DELIVERED', 460000, 2.0, 0, NULL),
('ORD-2025-0702', 6, '2025-09-05', '2025-09-06', 'DELIVERED', 286000, 2.5, 0, NULL),
('ORD-2025-0703', 3, '2025-09-08', '2025-09-09', 'DELIVERED', 224000, 5.0, 0, NULL),
('ORD-2025-0704', 8, '2025-09-11', '2025-09-12', 'DELIVERED', 248000, 6.0, 0, NULL),
('ORD-2025-0705', 4, '2025-09-15', '2025-09-16', 'DELIVERED', 168000, 1.5, 0, NULL),
('ORD-2025-0706', 1, '2025-09-18', '2025-09-19', 'DELIVERED', 408000, 2.0, 0, NULL),
('ORD-2025-0707', 7, '2025-09-22', '2025-09-23', 'DELIVERED', 124000, 1.0, 0, NULL),
('ORD-2025-0708', 5, '2025-09-24', '2025-09-25', 'DELIVERED',  88000, 4.0, 0, NULL),
('ORD-2025-0709', 3, '2025-09-26', '2025-09-27', 'DELIVERED', 194000, 5.0, 0, NULL),
('ORD-2025-0710', 10,'2025-09-29', '2025-09-30', 'DELIVERED', 140000, 3.0, 0, NULL);

-- October 2025 (target ₹26.8L — Diwali boom, best month)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-0801', 1, '2025-10-01', '2025-10-02', 'DELIVERED', 576000, 2.0, 0, NULL),
('ORD-2025-0802', 6, '2025-10-03', '2025-10-04', 'DELIVERED', 312000, 2.5, 0, NULL),
('ORD-2025-0803', 3, '2025-10-06', '2025-10-07', 'DELIVERED', 268000, 5.0, 0, NULL),
('ORD-2025-0804', 8, '2025-10-08', '2025-10-09', 'DELIVERED', 296000, 6.0, 0, NULL),
('ORD-2025-0805', 1, '2025-10-10', '2025-10-11', 'DELIVERED', 512000, 2.0, 0, NULL),
('ORD-2025-0806', 4, '2025-10-13', '2025-10-14', 'DELIVERED', 198000, 1.5, 0, NULL),
('ORD-2025-0807', 6, '2025-10-15', '2025-10-16', 'DELIVERED', 286000, 2.5, 0, NULL),
('ORD-2025-0808', 3, '2025-10-17', '2025-10-18', 'DELIVERED', 224000, 5.0, 0, NULL),
('ORD-2025-0809', 7, '2025-10-20', '2025-10-21', 'DELIVERED', 142000, 1.0, 0, NULL),
('ORD-2025-0810', 1, '2025-10-22', '2025-10-23', 'DELIVERED', 488000, 2.0, 0, NULL),
('ORD-2025-0811', 5, '2025-10-24', '2025-10-25', 'DELIVERED',  96000, 4.0, 0, NULL),
('ORD-2025-0812', 10,'2025-10-27', '2025-10-28', 'DELIVERED', 160000, 3.0, 0, NULL),
('ORD-2025-0813', 8, '2025-10-29', '2025-10-30', 'DELIVERED', 242000, 6.0, 0, NULL);

-- November 2025 (target ₹28.2L — post-Diwali rush continues)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-0901', 1, '2025-11-03', '2025-11-04', 'DELIVERED', 548000, 2.0, 0, NULL),
('ORD-2025-0902', 6, '2025-11-05', '2025-11-06', 'DELIVERED', 328000, 2.5, 0, NULL),
('ORD-2025-0903', 3, '2025-11-07', '2025-11-08', 'DELIVERED', 280000, 5.0, 0, NULL),
('ORD-2025-0904', 1, '2025-11-10', '2025-11-11', 'DELIVERED', 524000, 2.0, 0, NULL),
('ORD-2025-0905', 8, '2025-11-12', '2025-11-13', 'DELIVERED', 312000, 6.0, 0, NULL),
('ORD-2025-0906', 4, '2025-11-14', '2025-11-15', 'DELIVERED', 212000, 1.5, 0, NULL),
('ORD-2025-0907', 3, '2025-11-17', '2025-11-18', 'DELIVERED', 244000, 5.0, 0, NULL),
('ORD-2025-0908', 6, '2025-11-19', '2025-11-20', 'DELIVERED', 268000, 2.5, 0, NULL),
('ORD-2025-0909', 7, '2025-11-21', '2025-11-22', 'DELIVERED', 148000, 1.0, 0, NULL),
('ORD-2025-0910', 1, '2025-11-24', '2025-11-25', 'DELIVERED', 484000, 2.0, 0, NULL),
('ORD-2025-0911', 5, '2025-11-26', '2025-11-27', 'DELIVERED', 108000, 4.0, 0, NULL),
('ORD-2025-0912', 10,'2025-11-28', '2025-11-29', 'DELIVERED', 144000, 3.0, 0, NULL);

-- December 2025 (target ₹24.6L — year-end projects)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2025-1001', 1, '2025-12-02', '2025-12-03', 'DELIVERED', 476000, 2.0, 0, NULL),
('ORD-2025-1002', 6, '2025-12-04', '2025-12-05', 'DELIVERED', 284000, 2.5, 0, NULL),
('ORD-2025-1003', 3, '2025-12-08', '2025-12-09', 'DELIVERED', 248000, 5.0, 0, NULL),
('ORD-2025-1004', 8, '2025-12-10', '2025-12-11', 'DELIVERED', 272000, 6.0, 0, NULL),
('ORD-2025-1005', 1, '2025-12-13', '2025-12-14', 'DELIVERED', 448000, 2.0, 0, NULL),
('ORD-2025-1006', 4, '2025-12-16', '2025-12-17', 'DELIVERED', 184000, 1.5, 0, NULL),
('ORD-2025-1007', 3, '2025-12-18', '2025-12-19', 'DELIVERED', 216000, 5.0, 0, NULL),
('ORD-2025-1008', 7, '2025-12-22', '2025-12-23', 'DELIVERED', 128000, 1.0, 0, NULL),
('ORD-2025-1009', 5, '2025-12-24', '2025-12-26', 'DELIVERED',  86000, 4.0, 0, NULL),
('ORD-2025-1010', 1, '2025-12-27', '2025-12-28', 'DELIVERED', 406000, 2.0, 0, NULL),
('ORD-2025-1011', 10,'2025-12-29', '2025-12-30', 'DELIVERED', 162000, 3.0, 0, NULL),
('ORD-2025-1012', 6, '2025-12-30', '2025-12-31', 'DELIVERED', 250000, 2.5, 0, NULL);

-- January 2026 (target ₹21.8L — new year slow start)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2026-0101', 1, '2026-01-05', '2026-01-06', 'DELIVERED', 412000, 2.0, 0, NULL),
('ORD-2026-0102', 3, '2026-01-07', '2026-01-08', 'DELIVERED', 228000, 5.0, 0, NULL),
('ORD-2026-0103', 6, '2026-01-09', '2026-01-10', 'DELIVERED', 262000, 2.5, 0, NULL),
('ORD-2026-0104', 8, '2026-01-13', '2026-01-14', 'DELIVERED', 236000, 6.0, 0, NULL),
('ORD-2026-0105', 4, '2026-01-15', '2026-01-16', 'DELIVERED', 176000, 1.5, 0, NULL),
('ORD-2026-0106', 1, '2026-01-17', '2026-01-18', 'DELIVERED', 372000, 2.0, 0, NULL),
('ORD-2026-0107', 7, '2026-01-20', '2026-01-21', 'DELIVERED', 118000, 1.0, 0, NULL),
('ORD-2026-0108', 5, '2026-01-22', '2026-01-23', 'DELIVERED',  84000, 4.0, 0, NULL),
('ORD-2026-0109', 3, '2026-01-24', '2026-01-25', 'DELIVERED', 196000, 5.0, 0, NULL),
('ORD-2026-0110', 10,'2026-01-27', '2026-01-28', 'DELIVERED', 116000, 3.0, 0, NULL);

-- February 2026 (target ₹23.4L — wedding season)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2026-0201', 1, '2026-02-03', '2026-02-04', 'DELIVERED', 448000, 2.0, 0, NULL),
('ORD-2026-0202', 8, '2026-02-05', '2026-02-06', 'DELIVERED', 264000, 6.0, 0, NULL),
('ORD-2026-0203', 3, '2026-02-07', '2026-02-08', 'DELIVERED', 232000, 5.0, 0, NULL),
('ORD-2026-0204', 6, '2026-02-10', '2026-02-11', 'DELIVERED', 278000, 2.5, 0, NULL),
('ORD-2026-0205', 1, '2026-02-12', '2026-02-13', 'DELIVERED', 396000, 2.0, 0, NULL),
('ORD-2026-0206', 4, '2026-02-14', '2026-02-15', 'DELIVERED', 188000, 1.5, 0, NULL),
('ORD-2026-0207', 3, '2026-02-17', '2026-02-18', 'DELIVERED', 214000, 5.0, 0, NULL),
('ORD-2026-0208', 7, '2026-02-19', '2026-02-20', 'DELIVERED', 134000, 1.0, 0, NULL),
('ORD-2026-0209', 5, '2026-02-22', '2026-02-23', 'DELIVERED',  92000, 4.0, 0, NULL),
('ORD-2026-0210', 10,'2026-02-24', '2026-02-25', 'DELIVERED', 154000, 3.0, 0, NULL),
('ORD-2026-0211', 6, '2026-02-26', '2026-02-27', 'DELIVERED', 240000, 2.5, 0, NULL);

-- March 2026 (target ₹25.8L — financial year-end rush)
INSERT INTO customer_orders (order_number, customer_id, order_date, dispatch_date, status, total_value, discount_pct, delayed_hrs, delay_reason) VALUES
('ORD-2026-0301', 1, '2026-03-03', '2026-03-04', 'DELIVERED', 492000, 2.0, 0, NULL),
('ORD-2026-0302', 6, '2026-03-05', '2026-03-06', 'DELIVERED', 302000, 2.5, 0, NULL),
('ORD-2026-0303', 3, '2026-03-07', '2026-03-08', 'DELIVERED', 258000, 5.0, 0, NULL),
('ORD-2026-0304', 8, '2026-03-10', '2026-03-11', 'DELIVERED', 284000, 6.0, 0, NULL),
('ORD-2026-0305', 1, '2026-03-12', '2026-03-13', 'DELIVERED', 468000, 2.0, 0, NULL),
('ORD-2026-0306', 4, '2026-03-14', '2026-03-15', 'DELIVERED', 208000, 1.5, 0, NULL),
('ORD-2026-0307', 3, '2026-03-17', '2026-03-18', 'DELIVERED', 236000, 5.0, 0, NULL),
('ORD-2026-0308', 6, '2026-03-19', '2026-03-20', 'DELIVERED', 274000, 2.5, 0, NULL),
('ORD-2026-0309', 7, '2026-03-20', '2026-03-21', 'DELIVERED', 146000, 1.0, 0, NULL),
('ORD-2026-0310', 5, '2026-03-24', '2026-03-25', 'DELIVERED',  98000, 4.0, 0, NULL),
('ORD-2026-0311', 1, '2026-03-26', '2026-03-27', 'DELIVERED', 444000, 2.0, 0, NULL),
('ORD-2026-0312', 10,'2026-03-28', '2026-03-29', 'DELIVERED', 140000, 3.0, 0, NULL),
('ORD-2026-0313', 8, '2026-03-30', '2026-03-31', 'DELIVERED', 250000, 6.0, 0, NULL);

-- ============================================================
-- 15. ADDITIONAL GRN RECORDS — 12-Month History
-- ============================================================
INSERT INTO grn (grn_number, po_id, supplier_id, received_date, invoice_value, grn_value, match_status, discrepancy_amt, notes) VALUES
('GRN-2026-0090', NULL, 4, DATE_SUB(CURDATE(),INTERVAL  5 DAY), 148000, 148000, 'MATCH',    0,     'Greenlam walnut laminates — full receipt'),
('GRN-2026-0086', NULL, 1, DATE_SUB(CURDATE(),INTERVAL 12 DAY), 672000, 672000, 'MATCH',    0,     'Century 12mm BWP — 600 sheets, perfect delivery'),
('GRN-2026-0080', NULL, 2, DATE_SUB(CURDATE(),INTERVAL 20 DAY), 234000, 218000, 'MISMATCH', 16000, 'Greenply — 20 damaged sheets, credit note issued'),
('GRN-2026-0071', NULL, 1, DATE_SUB(CURDATE(),INTERVAL 32 DAY), 840000, 840000, 'MATCH',    0,     'Century BWP bulk order — Q1 stocking, flawless'),
('GRN-2026-0058', NULL, 3, DATE_SUB(CURDATE(),INTERVAL 48 DAY), 94000,  76000, 'MISMATCH', 18000, 'Gauri Flexi — grade substitution, 25 sheets returned'),
('GRN-2025-0194', NULL, 1, '2025-12-10', 504000, 504000, 'MATCH',    0,     'Century festive season restocking — Dec 2025'),
('GRN-2025-0161', NULL, 2, '2025-11-04', 312000, 304000, 'MISMATCH',  8000, 'Greenply Nov batch — 8 sheets short on 12mm MR'),
('GRN-2025-0148', NULL, 1, '2025-10-08', 672000, 672000, 'MATCH',    0,     'Century Oct peak pre-stock — Diwali rush'),
('GRN-2025-0122', NULL, 4, '2025-09-12', 186000, 186000, 'MATCH',    0,     'Greenlam Sept load — teak + walnut laminates'),
('GRN-2025-0106', NULL, 2, '2025-08-19', 248000, 236000, 'MISMATCH', 12000, 'Greenply Aug — 15 sheets water-damaged on arrival'),
('GRN-2025-0089', NULL, 1, '2025-07-14', 336000, 336000, 'MATCH',    0,     'Century Jul restocking during monsoon lull'),
('GRN-2025-0074', NULL, 3, '2025-06-20', 112000,  96000, 'MISMATCH', 16000, 'Gauri Jun — wrong thickness, 22 sheets rejected');

-- ============================================================
-- 16. ADDITIONAL FREIGHT TRIPS — 30-Day History
-- ============================================================
INSERT INTO freight_trips (lane_id, trip_date, vehicle_no, sheets_loaded, capacity_sheets, cost) VALUES
(1, DATE_SUB(CURDATE(),INTERVAL 13 DAY), 'KA01AB1234', 162, 200, 2349),
(2, DATE_SUB(CURDATE(),INTERVAL 13 DAY), 'KA01CD5678', 184, 200, 1546),
(4, DATE_SUB(CURDATE(),INTERVAL 14 DAY), 'KA01GH3456', 112, 200, 2128),
(5, DATE_SUB(CURDATE(),INTERVAL 15 DAY), 'KA01IJ7890', 106, 200, 2544),
(1, DATE_SUB(CURDATE(),INTERVAL 15 DAY), 'KA01AB1234', 172, 200, 2494),
(3, DATE_SUB(CURDATE(),INTERVAL 16 DAY), 'KA01EF9012', 118, 200, 2006),
(2, DATE_SUB(CURDATE(),INTERVAL 18 DAY), 'KA01CD5678', 188, 200, 1579),
(1, DATE_SUB(CURDATE(),INTERVAL 18 DAY), 'KA01AB1234', 160, 200, 2320),
(4, DATE_SUB(CURDATE(),INTERVAL 19 DAY), 'KA01GH3456', 124, 200, 2356),
(5, DATE_SUB(CURDATE(),INTERVAL 20 DAY), 'KA01IJ7890', 100, 200, 2400),
(1, DATE_SUB(CURDATE(),INTERVAL 22 DAY), 'KA01AB1234', 156, 200, 2262),
(2, DATE_SUB(CURDATE(),INTERVAL 22 DAY), 'KA01CD5678', 180, 200, 1512),
(3, DATE_SUB(CURDATE(),INTERVAL 23 DAY), 'KA01EF9012', 134, 200, 2278),
(1, DATE_SUB(CURDATE(),INTERVAL 25 DAY), 'KA01AB1234', 174, 200, 2523),
(2, DATE_SUB(CURDATE(),INTERVAL 25 DAY), 'KA01CD5678', 192, 200, 1613),
(4, DATE_SUB(CURDATE(),INTERVAL 27 DAY), 'KA01GH3456', 118, 200, 2242),
(5, DATE_SUB(CURDATE(),INTERVAL 28 DAY), 'KA01IJ7890', 110, 200, 2640),
(1, DATE_SUB(CURDATE(),INTERVAL 29 DAY), 'KA01AB1234', 166, 200, 2407),
(3, DATE_SUB(CURDATE(),INTERVAL 29 DAY), 'KA01EF9012', 128, 200, 2176),
(2, DATE_SUB(CURDATE(),INTERVAL 30 DAY), 'KA01CD5678', 178, 200, 1496);

-- ============================================================
-- 17. DEMAND FORECAST — All 18 Products Covered
-- ============================================================
INSERT INTO demand_forecast (product_id, forecast_month, forecast_qty, actual_qty, demand_signal, notes) VALUES
-- Products not yet in demand forecast (9,10,11,13,14,15,16,17,18) — 30/60/90 day
(9,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 28,  NULL, 'DEAD -82%',    'Gurjan BWP no movement — liquidate'),
(10, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 88,  NULL, 'GROWING +22%', 'Flexi demand rising with furniture contractors'),
(11, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 64,  NULL, 'STABLE +6.7%', 'Slow but consistent interior use'),
(13, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 110, NULL, 'GROWING +15%', 'Walnut laminates trending with interior firms'),
(15, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 140, NULL, 'STABLE',       '6mm MR steady demand from carpenters'),
(16, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 52,  NULL, 'GROWING +8%',  'Premium 25mm BWP gaining traction'),
(17, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 34,  NULL, 'FALLING -15%', 'Commercial 6mm slow — MR grades preferred'),
(18, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 96,  NULL, 'STABLE +9.4%', 'White laminates consistent demand'),
(6,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 182, NULL, 'STABLE +4.6%', '6mm MR Plain steady for furniture makers'),
(7,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 16,  NULL, 'DEAD',         '19mm commercial no demand — do not reorder'),
(8,  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), 22,  NULL, 'FALLING -20%', '12mm commercial demand declining'),
(11, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-01'), 72,  NULL, 'STABLE',       'Consistent'),
(13, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-01'), 128, NULL, 'GROWING',      'Interior season boost'),
(15, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-01'), 148, NULL, 'STABLE',       'Baseline'),
(11, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01'), 80,  NULL, 'STABLE',       'Monsoon neutral'),
(13, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01'), 142, NULL, 'GROWING',      'Interior peak during monsoon'),
(14, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01'), 238, NULL, 'SURGE',        'Pre-monsoon last push');

-- ============================================================
-- 18. SUPPLIER QUOTATIONS (30 rows across 9 items)
-- Columns: product_id, supplier_id, quote_date, rate, freight_cost,
--          moq, lead_time_days, valid_till, reliability_pct, notes, is_last_purchased
-- ============================================================
INSERT INTO quotations (product_id, supplier_id, quote_date, rate, freight_cost, moq, lead_time_days, valid_till, reliability_pct, notes, is_last_purchased) VALUES

-- ── 18mm BWP (product_id=1) ─────────────────────────────────────────────────
(1,  1,  '2026-04-01', 1680, 15, 100, 6,  '2026-04-30', 96.0, 'ISI certified, consistent quality', 1),
(1,  2,  '2026-04-01', 1720, 12, 150, 5,  '2026-04-25', 84.0, 'Faster delivery, premium packaging', 0),
(1,  5,  '2026-04-01', 1595, 18, 200, 8,  '2026-04-20', 71.0, 'Cheapest rate, grade inconsistency reported', 0),
(1,  6,  '2026-04-01', 1560, 20, 250, 10, '2026-04-18', 68.0, 'Lowest rate — verify grade before ordering', 0),

-- ── 12mm MR Plain (product_id=4) ────────────────────────────────────────────
(4,  1,  '2026-04-01',  800, 14, 100, 6,  '2026-04-30', 96.0, 'Century premium grade', 0),
(4,  2,  '2026-04-01',  780, 11, 200, 5,  '2026-04-28', 84.0, 'Bulk discount >500 sheets', 1),
(4,  6,  '2026-04-01',  740, 19, 300, 9,  '2026-04-22', 68.0, 'High MOQ, plan 10 days ahead', 0),

-- ── HPL 1mm Matte (product_id=19) ───────────────────────────────────────────
(19, 7,  '2026-04-05', 1150, 22,  50, 7,  '2026-05-15', 94.0, 'Premium finish, consistent colour match', 0),
(19, 4,  '2026-04-05', 1080, 18,  50, 6,  '2026-05-10', 91.0, 'Best overall value', 1),
(19, 8,  '2026-04-05',  990, 25, 100, 8,  '2026-04-30', 82.0, 'Competitive rate, wider colour range', 0),
(19, 9,  '2026-04-05', 1225, 20,  30, 5,  '2026-05-20', 97.0, 'International brand, highest reliability', 0),

-- ── HPL Compact 6mm (product_id=20) ─────────────────────────────────────────
(20, 7,  '2026-04-05', 3200, 35,  20, 7,  '2026-05-15', 94.0, 'FR-rated option available', 0),
(20, 4,  '2026-04-05', 2980, 28,  25, 6,  '2026-05-10', 91.0, 'Reliable grade, best price-quality', 1),
(20, 10, '2026-04-05', 2750, 40,  30, 10, '2026-04-28', 79.0, 'Lowest rate, longer lead time', 0),

-- ── Acrylic Laminate (product_id=21) ────────────────────────────────────────
(21, 8,  '2026-04-05', 1850, 28,  25, 8,  '2026-05-01', 82.0, 'Widest colour palette (180+ shades)', 0),
(21, 11, '2026-04-05', 1720, 22,  20, 7,  '2026-04-30', 88.0, 'Anti-scratch coating included', 1),
(21, 7,  '2026-04-05', 1960, 24,  30, 6,  '2026-05-10', 94.0, 'Premium UV-resistant grade', 0),

-- ── Aluminium Z-Profile 100mm Anodized (product_id=22) ──────────────────────
(22, 12, '2026-04-08', 1850, 45,  50, 10, '2026-05-15', 92.0, 'AA-25 anodizing, QUALICOAT certified', 0),
(22, 13, '2026-04-08', 1720, 38,  75, 8,  '2026-05-10', 85.0, 'Best price for bulk orders >200 RM', 1),
(22, 14, '2026-04-08', 1680, 52, 100, 12, '2026-05-05', 78.0, 'Cheaper, verify anodize thickness', 0),
(22, 15, '2026-04-08', 1790, 35,  60, 9,  '2026-05-20', 95.0, 'Most reliable, consistent alloy grade', 0),

-- ── Aluminium Z-Profile 80mm Powder Coated (product_id=23) ──────────────────
(23, 12, '2026-04-08', 1480, 40,  50, 12, '2026-05-15', 92.0, 'PVDF coating, 20-yr warranty', 0),
(23, 16, '2026-04-08', 1350, 35,  80, 9,  '2026-05-08', 83.0, 'Polyester powder coat, standard colours', 1),
(23, 13, '2026-04-08', 1290, 42, 100, 10, '2026-05-05', 85.0, 'Lowest rate — custom RAL +7 days lead', 0),

-- ── PVC Louver Blades 100mm (product_id=24) ─────────────────────────────────
(24, 17, '2026-04-08',  420, 18, 100, 6,  '2026-04-30', 80.0, 'UV stabilised, 10-yr warranty', 0),
(24, 13, '2026-04-08',  390, 15, 150, 5,  '2026-05-10', 85.0, 'Best value PVC grade', 1),
(24, 18, '2026-04-08',  445, 12, 100, 4,  '2026-05-15', 90.0, 'Highest grade PVC, fire retardant', 0),

-- ── Operable Louvre System Motorised (product_id=25) ────────────────────────
(25, 12, '2026-04-10', 8500, 200, 10, 21, '2026-05-30', 92.0, 'Somfy motor, 5-yr system warranty', 0),
(25, 19, '2026-04-10', 9200, 180,  8, 18, '2026-05-25', 96.0, 'European quality, BIM files available', 1),
(25, 20, '2026-04-10',10500, 150,  5, 25, '2026-06-15', 98.0, 'Premium — architectural specification grade', 0);

-- ============================================================
-- Done. Run /api/* endpoints to verify live data is served.
-- ============================================================
SELECT 'seed_complete.sql loaded successfully' AS status,
       (SELECT COUNT(*) FROM finance_monthly) AS finance_months,
       (SELECT COUNT(*) FROM stock_movements) AS movements,
       (SELECT COUNT(*) FROM customer_orders) AS orders,
       (SELECT COUNT(*) FROM demand_forecast) AS forecasts,
       (SELECT COUNT(*) FROM grn) AS grn_records,
       (SELECT COUNT(*) FROM freight_trips) AS freight_trips,
       (SELECT COUNT(*) FROM quotations) AS quotation_rows,
       (SELECT COUNT(*) FROM suppliers) AS supplier_count,
       (SELECT COUNT(*) FROM products) AS product_count;
