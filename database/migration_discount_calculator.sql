-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Distributor Discount Calculator
-- Tables:    discount_rules, discount_quotes
-- Requires:  schema.sql + seed_complete.sql already applied
-- Run once:  mysql -u root -p stocksense_inventory < migration_discount_calculator.sql
-- ─────────────────────────────────────────────────────────────────────────────

USE stocksense_inventory;

-- Segment × category × qty-slab → discount % with margin guardrail
CREATE TABLE IF NOT EXISTS discount_rules (
  rule_id          INT AUTO_INCREMENT PRIMARY KEY,
  rule_name        VARCHAR(120)  NOT NULL,
  segment          VARCHAR(50)   DEFAULT NULL,   -- NULL = applies to all segments
  category         VARCHAR(80)   DEFAULT NULL,   -- NULL = applies to all categories
  min_qty          INT           NOT NULL DEFAULT 0,
  max_qty          INT           DEFAULT NULL,   -- NULL = unlimited
  discount_pct     DECIMAL(5,2)  NOT NULL,
  min_margin_pct   DECIMAL(5,2)  NOT NULL DEFAULT 9.00,
  is_active        TINYINT(1)    NOT NULL DEFAULT 1,
  valid_from       DATE          DEFAULT NULL,
  valid_till       DATE          DEFAULT NULL,
  notes            TEXT          DEFAULT NULL,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_segment  (segment),
  INDEX idx_category (category),
  INDEX idx_active   (is_active)
);

-- Saved discount quotations with full price breakdown and lifecycle status
CREATE TABLE IF NOT EXISTS discount_quotes (
  quote_id         INT AUTO_INCREMENT PRIMARY KEY,
  quote_number     VARCHAR(30)   NOT NULL UNIQUE,
  customer_name    VARCHAR(120)  DEFAULT NULL,
  segment          VARCHAR(50)   NOT NULL,
  product_id       INT           DEFAULT NULL,
  product_name     VARCHAR(150)  NOT NULL,
  category         VARCHAR(80)   DEFAULT NULL,
  quantity         INT           NOT NULL,
  buy_price        DECIMAL(10,2) NOT NULL,
  sell_price       DECIMAL(10,2) NOT NULL,
  discount_pct     DECIMAL(5,2)  NOT NULL,
  discount_amount  DECIMAL(12,2) NOT NULL,
  final_price      DECIMAL(10,2) NOT NULL,
  total_gross      DECIMAL(12,2) NOT NULL,
  total_net        DECIMAL(12,2) NOT NULL,
  margin_pct       DECIMAL(5,2)  NOT NULL,
  margin_amount    DECIMAL(12,2) NOT NULL,
  rule_applied     VARCHAR(150)  DEFAULT NULL,
  status           VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
  notes            TEXT          DEFAULT NULL,
  valid_till       DATE          DEFAULT NULL,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
  INDEX idx_segment  (segment),
  INDEX idx_status   (status),
  INDEX idx_created  (created_at)
);

-- ─── Seed: discount rules calibrated to real product margins ──────────────────
-- BWP Plywood natural margin ≈ 12–14%; Commercial/Laminates ≈ 17–22%
-- Floor values are set so guardrail fires meaningfully but not for every sale

INSERT INTO discount_rules
  (rule_name, segment, category, min_qty, max_qty, discount_pct, min_margin_pct, notes)
VALUES
  -- Contractor slabs
  ('Contractor — Spot (<50 sheets)',           'Contractor',    NULL, 1,   49,  3.00, 9.00, 'Spot rate for small walk-in contractor orders'),
  ('Contractor — Regular (50–99 sheets)',      'Contractor',    NULL, 50,  99,  4.00, 8.50, 'Recurring mid-volume contractor'),
  ('Contractor — Project (100–199 sheets)',    'Contractor',    NULL, 100, 199, 5.00, 8.00, 'Project-scale order — protect floor'),
  ('Contractor — Bulk (200–499 sheets)',       'Contractor',    NULL, 200, 499, 7.00, 7.00, 'High-volume project — relationship discount'),
  ('Contractor — Mega (500+ sheets)',          'Contractor',    NULL, 500, NULL,9.00, 6.00, 'Mega project — review individually each time'),

  -- Interior Firm slabs
  ('Interior Firm — Spot (<50 sheets)',        'Interior Firm', NULL, 1,   49,  2.00, 9.50, 'Small interior fit-out sample order'),
  ('Interior Firm — Regular (50–99 sheets)',   'Interior Firm', NULL, 50,  99,  3.50, 9.00, 'Typical interior project order'),
  ('Interior Firm — Project (100–199 sheets)', 'Interior Firm', NULL, 100, 199, 5.00, 8.50, 'Full fit-out order'),
  ('Interior Firm — Bulk (200+ sheets)',       'Interior Firm', NULL, 200, NULL,7.00, 8.00, 'Large multi-room or commercial interior project'),

  -- Retailer slabs
  ('Retailer — Spot (<50 sheets)',             'Retailer',      NULL, 1,   49,  1.00, 10.00,'Minimal — retailer applies their own markup'),
  ('Retailer — Stock (50–99 sheets)',          'Retailer',      NULL, 50,  99,  2.00, 9.50, 'Seasonal stocking order'),
  ('Retailer — Bulk (100+ sheets)',            'Retailer',      NULL, 100, NULL,3.00, 9.00, 'Quarterly bulk replenishment'),

  -- Carpenter slabs
  ('Carpenter — Workshop (<25 sheets)',        'Carpenter',     NULL, 1,   24,  3.00, 9.00, 'Skilled trade loyalty — small workshop batch'),
  ('Carpenter — Order (25–49 sheets)',         'Carpenter',     NULL, 25,  49,  5.00, 8.50, 'Workshop project order'),
  ('Carpenter — Project (50–99 sheets)',       'Carpenter',     NULL, 50,  99,  7.00, 8.00, 'Large custom carpentry project'),
  ('Carpenter — Bulk (100+ sheets)',           'Carpenter',     NULL, 100, NULL,9.00, 7.00, 'Master carpenter quarterly bulk'),

  -- Category-specific overrides (higher priority than segment rules)
  ('HPL — Any Segment Spot',                  NULL, 'High Pressure Laminate', 1,   49,  5.00, 10.00,'HPL 1mm Matte has ~17% natural margin — room for more'),
  ('HPL — Any Segment Bulk',                  NULL, 'High Pressure Laminate', 50,  NULL,8.00,  9.00,'Bulk HPL project — still above floor'),
  ('Compact Laminate — Any Segment',          NULL, 'Compact Laminate',       1,   NULL,6.00, 11.00,'HPL Compact 6mm — premium product, guard margin'),
  ('Acrylic — Any Segment',                   NULL, 'Acrylic',                1,   NULL,5.00, 11.00,'Acrylic high-gloss: 18% natural margin'),
  ('Laminate — Any Segment',                  NULL, 'Laminate',               1,   NULL,4.00, 11.00,'Decorative laminates: 18–19% natural margin'),
  ('Commercial — Any Segment',                NULL, 'Commercial',             1,   NULL,5.00, 12.00,'Commercial grade: 21–22% natural margin'),
  ('Louvers Aluminium — Any Segment',         NULL, 'Louvers',                1,   NULL,4.00, 12.00,'Aluminium louvers: 18–20% margin'),
  ('Operable Louvre — Any Segment',           NULL, 'Operable Louvre System', 1,   NULL,5.00, 14.00,'Premium motorised system — protect margin carefully');


-- ─── Seed: sample quotes using real customers + real product prices ────────────
-- Prices match seed_complete.sql products table exactly
-- Margin % = (final_price - buy_price) / final_price × 100

INSERT INTO discount_quotes
  (quote_number, customer_name, segment, product_id, product_name, category,
   quantity, buy_price, sell_price, discount_pct, discount_amount,
   final_price, total_gross, total_net, margin_pct, margin_amount,
   rule_applied, status, notes, valid_till)
VALUES
  -- Q1: Mehta Constructions | Contractor | 18mm BWP 80sh | 4% | margin 8.76% SAFE
  ('DQ-20260415-001', 'Mehta Constructions', 'Contractor', 1, '18mm BWP (8x4)', 'BWP Plywood',
   80, 1680.00, 1920.00, 4.00, 6144.00,
   1843.20, 153600.00, 147456.00, 8.76, 13056.00,
   'Contractor — Regular (50–99 sheets)', 'ACCEPTED', NULL,
   DATE_ADD(CURDATE(), INTERVAL 3 DAY)),

  -- Q2: City Interiors | Interior Firm | HPL 1mm 60sh | 5% | margin 12.55% EXCELLENT
  ('DQ-20260416-001', 'City Interiors Pvt Ltd', 'Interior Firm', 19, 'HPL 1mm Matte (8x4)', 'High Pressure Laminate',
   60, 1080.00, 1300.00, 5.00, 3900.00,
   1235.00, 78000.00, 74100.00, 12.55, 9300.00,
   'HPL — Any Segment Bulk', 'SENT', 'Delivery in 2 weeks',
   DATE_ADD(CURDATE(), INTERVAL 5 DAY)),

  -- Q3: Kumar Furniture Works | Carpenter | 12mm BWP 70sh | 5% | margin 9.54% OK
  ('DQ-20260417-001', 'Kumar Furniture Works', 'Carpenter', 2, '12mm BWP (8x4)', 'BWP Plywood',
   70, 1100.00, 1280.00, 5.00, 4480.00,
   1216.00, 89600.00, 85120.00, 9.54, 8120.00,
   'Carpenter — Order (25–49 sheets)', 'ACCEPTED', NULL,
   DATE_ADD(CURDATE(), INTERVAL 1 DAY)),

  -- Q4: Decor Plus Interiors | Interior Firm | Acrylic 25sh | 5% | margin 13.78% EXCELLENT
  ('DQ-20260418-001', 'Decor Plus Interiors', 'Interior Firm', 21, 'Acrylic Laminate (8x4)', 'Acrylic',
   25, 1720.00, 2100.00, 5.00, 2625.00,
   1995.00, 52500.00, 49875.00, 13.78, 6875.00,
   'Acrylic — Any Segment', 'DRAFT', NULL,
   DATE_ADD(CURDATE(), INTERVAL 7 DAY)),

  -- Q5: Patel Hardware Store | Retailer | 18mm MR Plain 75sh | 2% | margin 13.08% OK
  ('DQ-20260419-001', 'Patel Hardware Store', 'Retailer', 5, '18mm MR Plain (8x4)', 'MR Plywood',
   75, 920.00, 1080.00, 2.00, 1620.00,
   1058.40, 81000.00, 79380.00, 13.08, 10380.00,
   'Retailer — Stock (50–99 sheets)', 'REJECTED', 'Customer asked for 5% — below policy floor for this product',
   DATE_SUB(CURDATE(), INTERVAL 1 DAY)),

  -- Q6: Sharma Constructions | Contractor | 18mm BWP 250sh | 7% | margin 5.91% DANGER (guardrail demo)
  ('DQ-20260420-001', 'Sharma Constructions', 'Contractor', 1, '18mm BWP (8x4)', 'BWP Plywood',
   250, 1680.00, 1920.00, 7.00, 33600.00,
   1785.60, 480000.00, 446400.00, 5.91, 26400.00,
   'Contractor — Bulk (200–499 sheets)', 'SENT', 'Below margin floor — manager approval required',
   DATE_ADD(CURDATE(), INTERVAL 6 DAY)),

  -- Q7: Nair Builders | Contractor | HPL Compact 6mm 20sh | 6% | margin 11.94% OK
  ('DQ-20260421-001', 'Nair Builders', 'Contractor', 20, 'HPL Compact 6mm (8x4)', 'Compact Laminate',
   20, 2980.00, 3600.00, 6.00, 4320.00,
   3384.00, 72000.00, 67680.00, 11.94, 8080.00,
   'Compact Laminate — Any Segment', 'ACCEPTED', NULL,
   DATE_ADD(CURDATE(), INTERVAL 7 DAY));
