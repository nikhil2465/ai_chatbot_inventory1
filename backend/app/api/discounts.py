"""
Distributor Discount Calculator — REST API endpoints.
Provides: dashboard data, real-time calculation, quote save/status update.
Follows the DB-first / mock-fallback pattern used across the project.
"""
import datetime
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Distributor Discounts"])

try:
    from app.db.connection import get_pool
    from app.db.discount_queries import (
        get_discount_dashboard as _db_get_dashboard,
        save_discount_quote   as _db_save_quote,
        update_quote_status   as _db_update_status,
    )
    _DB_AVAILABLE = True
except ImportError:
    _DB_AVAILABLE = False


# ── GET /api/discounts ────────────────────────────────────────────────────────

@router.get("/discounts")
async def get_discounts():
    """Return full discount calculator dashboard: KPIs, products, rules, quote history."""
    if _DB_AVAILABLE:
        try:
            pool = await get_pool()
            if pool:
                return await _db_get_dashboard(pool)
        except Exception as exc:
            logger.warning("Discount DB fetch failed, using mock: %s", exc)
    return _mock_discount_data()


# ── POST /api/discounts/calculate ─────────────────────────────────────────────

class CalcRequest(BaseModel):
    product_id:   int
    segment:      str
    quantity:     int   = Field(gt=0)
    override_pct: Optional[float] = None


@router.post("/discounts/calculate")
async def calculate_discount(req: CalcRequest):
    """
    Server-side discount calculation.
    Applies best matching rule for segment × category × qty slab.
    Used by AI assistant and external integrations.
    """
    # Load products + rules (DB or mock)
    if _DB_AVAILABLE:
        try:
            pool = await get_pool()
            if pool:
                data = await _db_get_dashboard(pool)
            else:
                data = _mock_discount_data()
        except Exception:
            data = _mock_discount_data()
    else:
        data = _mock_discount_data()

    product = next((p for p in data["products"] if p["product_id"] == req.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {req.product_id} not found")

    result = _compute_discount(
        rules        = data["rules"],
        product      = product,
        segment      = req.segment,
        quantity     = req.quantity,
        override_pct = req.override_pct,
    )
    return result


# ── POST /api/discounts/quotes ────────────────────────────────────────────────

class SaveQuoteRequest(BaseModel):
    customer_name: Optional[str] = None
    segment:       str
    product_id:    Optional[int] = None
    product_name:  str
    category:      Optional[str] = None
    quantity:      int
    buy_price:     float
    sell_price:    float
    discount_pct:  float
    discount_amount: float
    final_price:   float
    total_gross:   float
    total_net:     float
    margin_pct:    float
    margin_amount: float
    rule_applied:  Optional[str] = None
    notes:         Optional[str] = None


@router.post("/discounts/quotes")
async def save_quote(req: SaveQuoteRequest):
    """Persist a calculated discount quote. Returns generated quote number."""
    if _DB_AVAILABLE:
        try:
            pool = await get_pool()
            if pool:
                result = await _db_save_quote(pool, req.model_dump())
                if result.get("success"):
                    return result
        except Exception as exc:
            logger.warning("Quote save DB failed, using demo: %s", exc)

    # Demo mode: return a fake quote number
    today  = datetime.date.today().strftime('%Y%m%d')
    q_num  = f"DQ-{today}-DEMO"
    v_till = (datetime.date.today() + datetime.timedelta(days=7)).isoformat()
    return {
        "success":      True,
        "quote_number": q_num,
        "valid_till":   v_till,
        "demo_mode":    True,
    }


# ── PUT /api/discounts/quotes/{quote_id}/status ───────────────────────────────

VALID_STATUSES = {"DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"}


class StatusUpdate(BaseModel):
    status: str


@router.put("/discounts/quotes/{quote_id}/status")
async def update_status(quote_id: int, req: StatusUpdate):
    if req.status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Status must be one of {VALID_STATUSES}")

    if _DB_AVAILABLE:
        try:
            pool = await get_pool()
            if pool:
                return await _db_update_status(pool, quote_id, req.status)
        except Exception as exc:
            logger.warning("Status update DB failed: %s", exc)

    return {"success": True, "quote_id": quote_id, "status": req.status, "demo_mode": True}


# ── Shared calculation logic ──────────────────────────────────────────────────

def _compute_discount(rules, product, segment, quantity, override_pct=None):
    """Pure function: find best rule and return full price breakdown."""
    best_rule  = None
    best_score = -1

    for r in rules:
        if not r.get("is_active", True):
            continue
        if r["segment"] is not None and r["segment"] != segment:
            continue
        if r["category"] is not None and r["category"] != product["category"]:
            continue
        if r["min_qty"] > quantity:
            continue
        if r["max_qty"] is not None and r["max_qty"] < quantity:
            continue
        # Category-specific rules win over generic ones; among ties, higher discount wins
        score = (10 if r["category"] is not None else 0) + r["discount_pct"]
        if score > best_score:
            best_score = score
            best_rule  = r

    discount_pct   = float(override_pct) if override_pct is not None else (
        float(best_rule["discount_pct"]) if best_rule else 0.0
    )
    min_margin_pct = float(best_rule["min_margin_pct"]) if best_rule else 15.0

    sell_price    = float(product["sell_price"])
    buy_price     = float(product["buy_price"])
    disc_per_unit = round(sell_price * discount_pct / 100, 2)
    final_price   = round(sell_price - disc_per_unit, 2)
    total_gross   = round(sell_price * quantity, 2)
    total_disc    = round(disc_per_unit * quantity, 2)
    total_net     = round(final_price * quantity, 2)
    margin_unit   = round(final_price - buy_price, 2)
    margin_amt    = round(margin_unit * quantity, 2)
    margin_pct    = round((margin_unit / final_price * 100) if final_price > 0 else 0, 2)

    if margin_pct < 10:
        margin_status = "DANGER"
    elif margin_pct < min_margin_pct:
        margin_status = "WARNING"
    elif margin_pct < 20:
        margin_status = "OK"
    else:
        margin_status = "EXCELLENT"

    return {
        "product_name":    product["sku_name"],
        "category":        product["category"],
        "buy_price":       buy_price,
        "sell_price":      sell_price,
        "quantity":        quantity,
        "segment":         segment,
        "discount_pct":    discount_pct,
        "discount_amount": total_disc,
        "final_price":     final_price,
        "total_gross":     total_gross,
        "total_discount":  total_disc,
        "total_net":       total_net,
        "margin_per_unit": margin_unit,
        "margin_amount":   margin_amt,
        "margin_pct":      margin_pct,
        "min_margin_pct":  min_margin_pct,
        "rule_applied":    best_rule["rule_name"] if best_rule else (
            "Manual Override" if override_pct is not None else "No Rule — 0% Discount"
        ),
        "rule_id":         best_rule["rule_id"] if best_rule else None,
        "margin_status":   margin_status,
        "guardrail_ok":    margin_pct >= min_margin_pct,
        "is_override":     override_pct is not None,
    }


# ── Mock data (demo mode) ─────────────────────────────────────────────────────
# All prices are sourced directly from database/seed_complete.sql to ensure
# demo mode shows realistic numbers matching live-DB behaviour.

def _mock_discount_data() -> dict:
    # Exact buy_price / sell_price from seed_complete.sql products table
    products = [
        {"product_id": 1,  "sku_name": "18mm BWP (8x4)",                       "category": "BWP Plywood",             "buy_price": 1680.0, "sell_price": 1920.0},
        {"product_id": 2,  "sku_name": "12mm BWP (8x4)",                       "category": "BWP Plywood",             "buy_price": 1100.0, "sell_price": 1280.0},
        {"product_id": 3,  "sku_name": "9mm BWP (8x4)",                        "category": "BWP Plywood",             "buy_price": 820.0,  "sell_price": 940.0},
        {"product_id": 4,  "sku_name": "12mm MR Plain (8x4)",                  "category": "MR Plywood",              "buy_price": 780.0,  "sell_price": 940.0},
        {"product_id": 5,  "sku_name": "18mm MR Plain (8x4)",                  "category": "MR Plywood",              "buy_price": 920.0,  "sell_price": 1080.0},
        {"product_id": 6,  "sku_name": "6mm MR Plain (8x4)",                   "category": "MR Plywood",              "buy_price": 480.0,  "sell_price": 580.0},
        {"product_id": 7,  "sku_name": "19mm Commercial (8x4)",                "category": "Commercial",              "buy_price": 720.0,  "sell_price": 920.0},
        {"product_id": 8,  "sku_name": "12mm Commercial (8x4)",                "category": "Commercial",              "buy_price": 560.0,  "sell_price": 720.0},
        {"product_id": 9,  "sku_name": "6mm Gurjan BWP (8x4)",                 "category": "BWP Plywood",             "buy_price": 860.0,  "sell_price": 1100.0},
        {"product_id": 10, "sku_name": "8mm Flexi BWP (8x4)",                  "category": "Flexi",                   "buy_price": 680.0,  "sell_price": 840.0},
        {"product_id": 11, "sku_name": "10mm Flexi BWP (8x4)",                 "category": "Flexi",                   "buy_price": 820.0,  "sell_price": 980.0},
        {"product_id": 12, "sku_name": "Laminates Teak (8x4)",                 "category": "Laminate",                "buy_price": 620.0,  "sell_price": 760.0},
        {"product_id": 13, "sku_name": "Laminates Walnut (8x4)",               "category": "Laminate",                "buy_price": 640.0,  "sell_price": 780.0},
        {"product_id": 14, "sku_name": "8mm BWP (8x4)",                        "category": "BWP Plywood",             "buy_price": 980.0,  "sell_price": 1140.0},
        {"product_id": 15, "sku_name": "6mm MR Plywood (8x4)",                 "category": "MR Plywood",              "buy_price": 460.0,  "sell_price": 560.0},
        {"product_id": 16, "sku_name": "25mm BWP (8x4)",                       "category": "BWP Plywood",             "buy_price": 2100.0, "sell_price": 2400.0},
        {"product_id": 17, "sku_name": "6mm Commercial (8x4)",                 "category": "Commercial",              "buy_price": 380.0,  "sell_price": 480.0},
        {"product_id": 18, "sku_name": "Laminates White (8x4)",                "category": "Laminate",                "buy_price": 580.0,  "sell_price": 720.0},
        {"product_id": 19, "sku_name": "HPL 1mm Matte (8x4)",                  "category": "High Pressure Laminate",  "buy_price": 1080.0, "sell_price": 1300.0},
        {"product_id": 20, "sku_name": "HPL Compact 6mm (8x4)",                "category": "Compact Laminate",        "buy_price": 2980.0, "sell_price": 3600.0},
        {"product_id": 21, "sku_name": "Acrylic Laminate (8x4)",               "category": "Acrylic",                 "buy_price": 1720.0, "sell_price": 2100.0},
        {"product_id": 22, "sku_name": "Aluminium Z-Profile 100mm Anodized",   "category": "Louvers",                 "buy_price": 1720.0, "sell_price": 2100.0},
        {"product_id": 23, "sku_name": "Aluminium Z-Profile 80mm Powder Coated","category": "Louvers",                "buy_price": 1350.0, "sell_price": 1680.0},
        {"product_id": 24, "sku_name": "PVC Louver Blades 100mm",              "category": "Louvers",                 "buy_price": 390.0,  "sell_price": 580.0},
        {"product_id": 25, "sku_name": "Operable Louvre System (Motorised)",   "category": "Operable Louvre System",  "buy_price": 9200.0, "sell_price": 12000.0},
    ]

    # min_margin_pct calibrated against real product margins (BWP ~12-14%, HPL ~17%, etc.)
    rules = [
        # Contractor slabs
        {"rule_id": 1,  "rule_name": "Contractor — Spot (<50 sheets)",           "segment": "Contractor",    "category": None, "min_qty": 1,   "max_qty": 49,  "discount_pct": 3.0,  "min_margin_pct": 9.0,  "is_active": 1},
        {"rule_id": 2,  "rule_name": "Contractor — Regular (50–99 sheets)",      "segment": "Contractor",    "category": None, "min_qty": 50,  "max_qty": 99,  "discount_pct": 4.0,  "min_margin_pct": 8.5,  "is_active": 1},
        {"rule_id": 3,  "rule_name": "Contractor — Project (100–199 sheets)",    "segment": "Contractor",    "category": None, "min_qty": 100, "max_qty": 199, "discount_pct": 5.0,  "min_margin_pct": 8.0,  "is_active": 1},
        {"rule_id": 4,  "rule_name": "Contractor — Bulk (200–499 sheets)",       "segment": "Contractor",    "category": None, "min_qty": 200, "max_qty": 499, "discount_pct": 7.0,  "min_margin_pct": 7.0,  "is_active": 1},
        {"rule_id": 5,  "rule_name": "Contractor — Mega (500+ sheets)",          "segment": "Contractor",    "category": None, "min_qty": 500, "max_qty": None,"discount_pct": 9.0,  "min_margin_pct": 6.0,  "is_active": 1},
        # Interior Firm slabs
        {"rule_id": 6,  "rule_name": "Interior Firm — Spot (<50 sheets)",        "segment": "Interior Firm", "category": None, "min_qty": 1,   "max_qty": 49,  "discount_pct": 2.0,  "min_margin_pct": 9.5,  "is_active": 1},
        {"rule_id": 7,  "rule_name": "Interior Firm — Regular (50–99 sheets)",   "segment": "Interior Firm", "category": None, "min_qty": 50,  "max_qty": 99,  "discount_pct": 3.5,  "min_margin_pct": 9.0,  "is_active": 1},
        {"rule_id": 8,  "rule_name": "Interior Firm — Project (100–199 sheets)", "segment": "Interior Firm", "category": None, "min_qty": 100, "max_qty": 199, "discount_pct": 5.0,  "min_margin_pct": 8.5,  "is_active": 1},
        {"rule_id": 9,  "rule_name": "Interior Firm — Bulk (200+ sheets)",       "segment": "Interior Firm", "category": None, "min_qty": 200, "max_qty": None,"discount_pct": 7.0,  "min_margin_pct": 8.0,  "is_active": 1},
        # Retailer slabs
        {"rule_id": 10, "rule_name": "Retailer — Spot (<50 sheets)",             "segment": "Retailer",      "category": None, "min_qty": 1,   "max_qty": 49,  "discount_pct": 1.0,  "min_margin_pct": 10.0, "is_active": 1},
        {"rule_id": 11, "rule_name": "Retailer — Stock (50–99 sheets)",          "segment": "Retailer",      "category": None, "min_qty": 50,  "max_qty": 99,  "discount_pct": 2.0,  "min_margin_pct": 9.5,  "is_active": 1},
        {"rule_id": 12, "rule_name": "Retailer — Bulk (100+ sheets)",            "segment": "Retailer",      "category": None, "min_qty": 100, "max_qty": None,"discount_pct": 3.0,  "min_margin_pct": 9.0,  "is_active": 1},
        # Carpenter slabs
        {"rule_id": 13, "rule_name": "Carpenter — Workshop (<25 sheets)",        "segment": "Carpenter",     "category": None, "min_qty": 1,   "max_qty": 24,  "discount_pct": 3.0,  "min_margin_pct": 9.0,  "is_active": 1},
        {"rule_id": 14, "rule_name": "Carpenter — Order (25–49 sheets)",         "segment": "Carpenter",     "category": None, "min_qty": 25,  "max_qty": 49,  "discount_pct": 5.0,  "min_margin_pct": 8.5,  "is_active": 1},
        {"rule_id": 15, "rule_name": "Carpenter — Project (50–99 sheets)",       "segment": "Carpenter",     "category": None, "min_qty": 50,  "max_qty": 99,  "discount_pct": 7.0,  "min_margin_pct": 8.0,  "is_active": 1},
        {"rule_id": 16, "rule_name": "Carpenter — Bulk (100+ sheets)",           "segment": "Carpenter",     "category": None, "min_qty": 100, "max_qty": None,"discount_pct": 9.0,  "min_margin_pct": 7.0,  "is_active": 1},
        # Category overrides — these override generic rules for high-margin product lines
        {"rule_id": 17, "rule_name": "HPL — Any Segment Spot",                   "segment": None, "category": "High Pressure Laminate", "min_qty": 1,   "max_qty": 49,  "discount_pct": 5.0, "min_margin_pct": 10.0, "is_active": 1},
        {"rule_id": 18, "rule_name": "HPL — Any Segment Bulk",                   "segment": None, "category": "High Pressure Laminate", "min_qty": 50,  "max_qty": None,"discount_pct": 8.0, "min_margin_pct": 9.0,  "is_active": 1},
        {"rule_id": 19, "rule_name": "Compact Laminate — Any Segment",           "segment": None, "category": "Compact Laminate",       "min_qty": 1,   "max_qty": None,"discount_pct": 6.0, "min_margin_pct": 11.0, "is_active": 1},
        {"rule_id": 20, "rule_name": "Acrylic — Any Segment",                    "segment": None, "category": "Acrylic",                "min_qty": 1,   "max_qty": None,"discount_pct": 5.0, "min_margin_pct": 11.0, "is_active": 1},
        {"rule_id": 21, "rule_name": "Laminate — Any Segment",                   "segment": None, "category": "Laminate",               "min_qty": 1,   "max_qty": None,"discount_pct": 4.0, "min_margin_pct": 11.0, "is_active": 1},
        {"rule_id": 22, "rule_name": "Commercial — Any Segment",                 "segment": None, "category": "Commercial",             "min_qty": 1,   "max_qty": None,"discount_pct": 5.0, "min_margin_pct": 12.0, "is_active": 1},
        {"rule_id": 23, "rule_name": "Louvers Aluminium — Any Segment",          "segment": None, "category": "Louvers",                "min_qty": 1,   "max_qty": None,"discount_pct": 4.0, "min_margin_pct": 12.0, "is_active": 1},
        {"rule_id": 24, "rule_name": "Operable Louvre — Any Segment",            "segment": None, "category": "Operable Louvre System", "min_qty": 1,   "max_qty": None,"discount_pct": 5.0, "min_margin_pct": 14.0, "is_active": 1},
    ]

    # Quotes recalculated with exact seed prices — margin % reflects real business economics
    today = datetime.date.today()
    quotes = [
        # Q1: Mehta Constructions | Contractor | 18mm BWP 80sh | 4% | margin 8.76% (OK)
        {"quote_id": 1, "quote_number": "DQ-20260415-001", "customer_name": "Mehta Constructions",
         "segment": "Contractor",    "product_name": "18mm BWP (8x4)",    "category": "BWP Plywood",
         "quantity": 80,  "sell_price": 1920.0, "discount_pct": 4.0,
         "discount_amount": 6144.0,  "final_price": 1843.2, "total_gross": 153600.0,
         "total_net": 147456.0,  "margin_pct": 8.76,  "margin_amount": 13056.0,
         "rule_applied": "Contractor — Regular (50–99 sheets)", "status": "ACCEPTED",
         "notes": None, "valid_till": (today + datetime.timedelta(days=3)).isoformat(),
         "created_at": "2026-04-15T10:22:00"},

        # Q2: City Interiors | Interior Firm | HPL 1mm 60sh | 5% | margin 12.55% (EXCELLENT)
        {"quote_id": 2, "quote_number": "DQ-20260416-001", "customer_name": "City Interiors Pvt Ltd",
         "segment": "Interior Firm", "product_name": "HPL 1mm Matte (8x4)", "category": "High Pressure Laminate",
         "quantity": 60,  "sell_price": 1300.0, "discount_pct": 5.0,
         "discount_amount": 3900.0,  "final_price": 1235.0, "total_gross": 78000.0,
         "total_net": 74100.0,  "margin_pct": 12.55, "margin_amount": 9300.0,
         "rule_applied": "HPL — Any Segment Bulk", "status": "SENT",
         "notes": "Delivery in 2 weeks", "valid_till": (today + datetime.timedelta(days=5)).isoformat(),
         "created_at": "2026-04-16T14:05:00"},

        # Q3: Kumar Furniture Works | Carpenter | 12mm BWP 70sh | 5% | margin 9.54% (OK)
        {"quote_id": 3, "quote_number": "DQ-20260417-001", "customer_name": "Kumar Furniture Works",
         "segment": "Carpenter",     "product_name": "12mm BWP (8x4)",    "category": "BWP Plywood",
         "quantity": 70,  "sell_price": 1280.0, "discount_pct": 5.0,
         "discount_amount": 4480.0,  "final_price": 1216.0, "total_gross": 89600.0,
         "total_net": 85120.0,  "margin_pct": 9.54,  "margin_amount": 8120.0,
         "rule_applied": "Carpenter — Order (25–49 sheets)", "status": "ACCEPTED",
         "notes": None, "valid_till": (today + datetime.timedelta(days=1)).isoformat(),
         "created_at": "2026-04-17T09:30:00"},

        # Q4: Decor Plus Interiors | Interior Firm | Acrylic 25sh | 5% | margin 13.78% (EXCELLENT)
        {"quote_id": 4, "quote_number": "DQ-20260418-001", "customer_name": "Decor Plus Interiors",
         "segment": "Interior Firm", "product_name": "Acrylic Laminate (8x4)", "category": "Acrylic",
         "quantity": 25,  "sell_price": 2100.0, "discount_pct": 5.0,
         "discount_amount": 2625.0,  "final_price": 1995.0, "total_gross": 52500.0,
         "total_net": 49875.0,  "margin_pct": 13.78, "margin_amount": 6875.0,
         "rule_applied": "Acrylic — Any Segment", "status": "DRAFT",
         "notes": None, "valid_till": (today + datetime.timedelta(days=7)).isoformat(),
         "created_at": "2026-04-18T16:45:00"},

        # Q5: Patel Hardware Store | Retailer | 18mm MR 75sh | 2% | margin 13.08% (OK)
        {"quote_id": 5, "quote_number": "DQ-20260419-001", "customer_name": "Patel Hardware Store",
         "segment": "Retailer",      "product_name": "18mm MR Plain (8x4)", "category": "MR Plywood",
         "quantity": 75,  "sell_price": 1080.0, "discount_pct": 2.0,
         "discount_amount": 1620.0,  "final_price": 1058.4, "total_gross": 81000.0,
         "total_net": 79380.0,  "margin_pct": 13.08, "margin_amount": 10380.0,
         "rule_applied": "Retailer — Stock (50–99 sheets)", "status": "REJECTED",
         "notes": "Customer requested 5% — declined: below margin floor",
         "valid_till": (today - datetime.timedelta(days=1)).isoformat(),
         "created_at": "2026-04-19T11:15:00"},

        # Q6: Sharma Constructions | Contractor | 18mm BWP 250sh | 7% | margin 5.91% (DANGER — guardrail demo)
        {"quote_id": 6, "quote_number": "DQ-20260420-001", "customer_name": "Sharma Constructions",
         "segment": "Contractor",    "product_name": "18mm BWP (8x4)",    "category": "BWP Plywood",
         "quantity": 250, "sell_price": 1920.0, "discount_pct": 7.0,
         "discount_amount": 33600.0, "final_price": 1785.6, "total_gross": 480000.0,
         "total_net": 446400.0, "margin_pct": 5.91,  "margin_amount": 26400.0,
         "rule_applied": "Contractor — Bulk (200–499 sheets)", "status": "SENT",
         "notes": "Below margin floor — manager approval needed",
         "valid_till": (today + datetime.timedelta(days=6)).isoformat(),
         "created_at": "2026-04-20T08:20:00"},

        # Q7: Nair Builders | Contractor | HPL Compact 20sh | 6% | margin 11.94% (OK)
        {"quote_id": 7, "quote_number": "DQ-20260421-001", "customer_name": "Nair Builders",
         "segment": "Contractor",    "product_name": "HPL Compact 6mm (8x4)", "category": "Compact Laminate",
         "quantity": 20,  "sell_price": 3600.0, "discount_pct": 6.0,
         "discount_amount": 4320.0,  "final_price": 3384.0, "total_gross": 72000.0,
         "total_net": 67680.0,  "margin_pct": 11.94, "margin_amount": 8080.0,
         "rule_applied": "Compact Laminate — Any Segment", "status": "ACCEPTED",
         "notes": None, "valid_till": (today + datetime.timedelta(days=7)).isoformat(),
         "created_at": "2026-04-21T10:00:00"},
    ]

    # KPIs derived from the 7 real quotes above
    return {
        "kpis": {
            "quotes_this_month":  7,
            "avg_discount_pct":   4.9,     # avg(3,4,5,5,2,7,6)
            "total_quoted_value": 950011.0, # sum of all total_net
            "avg_margin_pct":     10.8,    # avg(8.76,12.55,9.54,13.78,13.08,5.91,11.94)
            "acceptance_rate":    42.9,    # 3 accepted out of 7
        },
        "products":  products,
        "rules":     rules,
        "quotes":    quotes,
        "segment_summary": [
            {"segment": "Contractor",    "quote_count": 3, "avg_discount": 5.3, "total_value": 661536},
            {"segment": "Interior Firm", "quote_count": 2, "avg_discount": 5.0, "total_value": 123975},
            {"segment": "Retailer",      "quote_count": 1, "avg_discount": 2.0, "total_value": 79380},
            {"segment": "Carpenter",     "quote_count": 1, "avg_discount": 5.0, "total_value": 85120},
        ],
        "data_source": "mock",
    }
