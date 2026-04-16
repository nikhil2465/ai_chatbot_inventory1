"""
PO & GRN REST API endpoints.
Provides dashboard data for the PO & GRN page, and a create-PO action.
Both endpoints follow the same DB-first / mock-fallback pattern as the chat tools.
"""
import datetime
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(tags=["PO & GRN"])

try:
    from app.db.connection import get_pool
    from app.db.po_grn_queries import (
        get_po_grn_dashboard,
        create_purchase_order as _db_create_po,
    )
    _DB_AVAILABLE = True
except ImportError:
    _DB_AVAILABLE = False


# ── GET /api/po-grn  ──────────────────────────────────────────────────────────

@router.get("/po-grn")
async def get_po_grn():
    """Return full PO & GRN dashboard: KPIs, open POs, GRN discrepancies."""
    if _DB_AVAILABLE:
        try:
            pool = await get_pool()
            if pool:
                return await get_po_grn_dashboard(pool)
        except Exception as exc:
            logger.warning("PO/GRN DB fetch failed, using mock: %s", exc)

    return _mock_po_grn_data()


# ── POST /api/po  ─────────────────────────────────────────────────────────────

class CreatePORequest(BaseModel):
    supplier_name: str
    sku_name: str
    quantity: int
    unit_price: Optional[float] = None
    expected_date: Optional[str] = None
    notes: Optional[str] = None


@router.post("/po")
async def create_po(req: CreatePORequest):
    """Create a new purchase order (DB or demo mode)."""
    if _DB_AVAILABLE:
        try:
            pool = await get_pool()
            if pool:
                result = await _db_create_po(pool, req.model_dump())
                if result.get("success"):
                    return result
                raise HTTPException(status_code=400, detail=result.get("error", "PO creation failed"))
        except HTTPException:
            raise
        except Exception as exc:
            logger.warning("DB PO creation failed, using demo: %s", exc)

    # Demo-mode mock response
    po_number = f"PO-{datetime.date.today().strftime('%Y%m%d')}-DEMO"
    return {
        "success": True,
        "po_number": po_number,
        "supplier": req.supplier_name,
        "sku": req.sku_name,
        "quantity": req.quantity,
        "unit_price": req.unit_price or 0,
        "total_value": (req.unit_price or 0) * req.quantity,
        "expected_date": req.expected_date or (
            datetime.date.today() + datetime.timedelta(days=7)
        ).isoformat(),
        "notes": req.notes or "Created via InvenIQ AI Assistant",
        "demo_mode": True,
    }


# ── Mock data (same shape as DB, matches existing static POGRN.jsx data) ──────

def _mock_po_grn_data() -> dict:
    return {
        "kpis": {
            "open_pos": 8,
            "open_po_value": "₹12.4L",
            "overdue_pos": 2,
            "overdue_po_list": "PO-7734 (Greenply +2d), PO-7731 (Gauri +4d)",
            "grn_match_rate": "96%",
            "grn_mismatches_mtd": 3,
            "grn_variance_value": "₹8,400",
            "partial_pos": 3,
            "ai_auto_pos": 4,
        },
        "open_pos": [
            {
                "po_number": "PO-7734", "supplier": "Greenply Industries",
                "sku": "12mm MR Plain", "qty_ordered": 300, "qty_received": 180,
                "fill_pct": 60, "value": "₹2.16L", "eta": "Overdue +2d",
                "status": "OVERDUE", "overdue_days": 2,
            },
            {
                "po_number": "PO-7733", "supplier": "Century Plyboards",
                "sku": "18mm BWP", "qty_ordered": 200, "qty_received": 200,
                "fill_pct": 100, "value": "₹2.84L", "eta": "Received",
                "status": "RECEIVED", "overdue_days": 0,
            },
            {
                "po_number": "PO-7732", "supplier": "Century Plyboards",
                "sku": "12mm BWP", "qty_ordered": 150, "qty_received": 130,
                "fill_pct": 87, "value": "₹1.73L", "eta": "ETA 2d",
                "status": "PARTIAL", "overdue_days": 0,
            },
            {
                "po_number": "PO-7731", "supplier": "Gauri Laminates",
                "sku": "8mm Flexi", "qty_ordered": 200, "qty_received": 76,
                "fill_pct": 38, "value": "₹0.49L", "eta": "Overdue +4d",
                "status": "OVERDUE", "overdue_days": 4,
            },
            {
                "po_number": "PO-7730", "supplier": "Supreme Laminates",
                "sku": "Laminates Teak", "qty_ordered": 100, "qty_received": 100,
                "fill_pct": 100, "value": "₹0.34L", "eta": "Received",
                "status": "RECEIVED", "overdue_days": 0,
            },
        ],
        "grn_discrepancies": [
            {
                "grn_number": "GRN-4421", "po_number": "PO-7728",
                "supplier": "Gauri Laminates",
                "invoice_value": "₹8,200", "grn_value": "₹5,000",
                "discrepancy_amt": "₹3,200",
                "notes": "Wrong Grade — 8mm MR received vs 8mm BWP ordered",
                "action": "Return & Reorder",
            },
            {
                "grn_number": "GRN-4418", "po_number": "PO-7725",
                "supplier": "Gauri Laminates",
                "invoice_value": "₹12,400", "grn_value": "₹9,600",
                "discrepancy_amt": "₹2,800",
                "notes": "Short by 14 sheets",
                "action": "Raise Credit Note",
            },
            {
                "grn_number": "GRN-4412", "po_number": "PO-7719",
                "supplier": "Gauri Laminates",
                "invoice_value": "₹2,400", "grn_value": "₹0",
                "discrepancy_amt": "₹2,400",
                "notes": "Price Mismatch: Invoice ₹156 vs PO rate ₹142",
                "action": "Block Payment",
            },
        ],
        "data_source": "mock",
    }
