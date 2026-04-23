"""
MySQL queries for PO & GRN data.
Used by both the REST API endpoints and the chatbot po_grn_tool.
"""
import datetime
import aiomysql


async def get_po_grn_dashboard(pool: aiomysql.Pool) -> dict:
    """Fetch full PO & GRN dashboard data: KPIs, open POs, GRN discrepancies."""
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:

            # KPI: Open POs count + value
            await cur.execute("""
                SELECT COUNT(*) AS open_count,
                       COALESCE(SUM(total_value), 0) AS open_value
                FROM purchase_orders
                WHERE status IN ('OPEN', 'PARTIAL', 'OVERDUE')
            """)
            po_summary = await cur.fetchone()

            # KPI: Overdue POs
            await cur.execute("""
                SELECT COUNT(*) AS overdue_count,
                       GROUP_CONCAT(
                           CONCAT(po.po_number, ' (', s.supplier_name, ' +',
                                  DATEDIFF(CURDATE(), po.expected_date), 'd)')
                           ORDER BY DATEDIFF(CURDATE(), po.expected_date) DESC
                           SEPARATOR ', '
                       ) AS overdue_list
                FROM purchase_orders po
                JOIN suppliers s ON po.supplier_id = s.supplier_id
                WHERE po.status = 'OVERDUE'
            """)
            overdue_row = await cur.fetchone()

            # KPI: GRN match rate (last 30 days)
            await cur.execute("""
                SELECT COUNT(*) AS total_grn,
                       SUM(CASE WHEN match_status = 'MATCH' THEN 1 ELSE 0 END) AS matched,
                       SUM(CASE WHEN match_status = 'MISMATCH' THEN 1 ELSE 0 END) AS mismatched,
                       COALESCE(SUM(discrepancy_amt), 0) AS total_variance
                FROM grn
                WHERE received_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            """)
            grn_stats = await cur.fetchone()

            # KPI: Partial POs
            await cur.execute("""
                SELECT COUNT(*) AS partial_count
                FROM purchase_orders
                WHERE status = 'PARTIAL'
            """)
            partial_row = await cur.fetchone()

            # Open POs list with item details
            await cur.execute("""
                SELECT po.po_id, po.po_number, s.supplier_name,
                       GROUP_CONCAT(p.sku_name ORDER BY pi.po_item_id SEPARATOR ', ') AS sku_list,
                       COALESCE(SUM(pi.qty_ordered), 0) AS qty_ordered,
                       COALESCE(SUM(pi.qty_received), 0) AS qty_received,
                       po.total_value, po.expected_date, po.status,
                       GREATEST(DATEDIFF(CURDATE(), po.expected_date), 0) AS overdue_days
                FROM purchase_orders po
                JOIN suppliers s ON po.supplier_id = s.supplier_id
                LEFT JOIN po_items pi ON po.po_id = pi.po_id
                LEFT JOIN products p ON pi.product_id = p.product_id
                WHERE po.status IN ('OPEN', 'PARTIAL', 'OVERDUE')
                GROUP BY po.po_id
                ORDER BY
                    FIELD(po.status, 'OVERDUE', 'PARTIAL', 'OPEN'),
                    po.expected_date ASC
                LIMIT 20
            """)
            open_po_rows = await cur.fetchall()

            # GRN discrepancies (mismatches)
            await cur.execute("""
                SELECT g.grn_number, po.po_number, s.supplier_name,
                       g.invoice_value, g.grn_value, g.discrepancy_amt,
                       g.notes, g.match_status, g.received_date
                FROM grn g
                JOIN suppliers s ON g.supplier_id = s.supplier_id
                LEFT JOIN purchase_orders po ON g.po_id = po.po_id
                WHERE g.match_status = 'MISMATCH'
                ORDER BY g.received_date DESC
                LIMIT 10
            """)
            grn_rows = await cur.fetchall()

    total_grn = int(grn_stats["total_grn"] or 1)
    matched = int(grn_stats["matched"] or 0)
    match_rate = f"{round(matched / max(total_grn, 1) * 100)}%"

    open_pos_list = []
    for r in open_po_rows:
        qty_ord = int(r["qty_ordered"] or 0)
        qty_rec = int(r["qty_received"] or 0)
        fill_pct = round(qty_rec / max(qty_ord, 1) * 100)
        overdue_days = int(r["overdue_days"] or 0)
        if r["status"] == "OVERDUE":
            eta = f"Overdue +{overdue_days}d"
        elif r["status"] == "PARTIAL":
            eta = "In progress"
        elif r["expected_date"]:
            days_left = (r["expected_date"] - datetime.date.today()).days
            eta = f"ETA {days_left}d" if days_left >= 0 else "Overdue"
        else:
            eta = "-"

        open_pos_list.append({
            "po_number": r["po_number"],
            "supplier": r["supplier_name"],
            "sku": r["sku_list"] or "-",
            "qty_ordered": qty_ord,
            "qty_received": qty_rec,
            "fill_pct": fill_pct,
            "value": f"₹{float(r['total_value'] or 0) / 100000:.2f}L",
            "eta": eta,
            "status": r["status"],
            "overdue_days": overdue_days,
        })

    grn_discrepancies = []
    for r in grn_rows:
        disc_amt = float(r["discrepancy_amt"] or 0)
        grn_discrepancies.append({
            "grn_number": r["grn_number"],
            "po_number": r["po_number"] or "-",
            "supplier": r["supplier_name"],
            "invoice_value": f"₹{float(r['invoice_value'] or 0):,.0f}",
            "grn_value": f"₹{float(r['grn_value'] or 0):,.0f}",
            "discrepancy_amt": f"₹{disc_amt:,.0f}",
            "notes": r["notes"] or "Discrepancy detected",
            "action": _suggest_grn_action(r["notes"] or ""),
        })

    return {
        "kpis": {
            "open_pos": int(po_summary["open_count"]),
            "open_po_value": f"₹{float(po_summary['open_value']) / 100000:.1f}L",
            "overdue_pos": int(overdue_row["overdue_count"]),
            "overdue_po_list": overdue_row["overdue_list"] or "",
            "grn_match_rate": match_rate,
            "grn_mismatches_mtd": int(grn_stats["mismatched"] or 0),
            "grn_variance_value": f"₹{float(grn_stats['total_variance'] or 0):,.0f}",
            "partial_pos": int(partial_row["partial_count"]),
        },
        "open_pos": open_pos_list,
        "grn_discrepancies": grn_discrepancies,
        "data_source": "mysql",
    }


async def create_purchase_order(pool: aiomysql.Pool, po_data: dict) -> dict:
    """Create a new purchase order in the database. Returns success dict or error."""
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:

            # Resolve supplier
            await cur.execute(
                "SELECT supplier_id, supplier_name FROM suppliers "
                "WHERE supplier_name LIKE %s AND is_active=1 LIMIT 1",
                (f"%{po_data['supplier_name']}%",),
            )
            supplier = await cur.fetchone()
            if not supplier:
                return {"success": False, "error": f"Supplier '{po_data['supplier_name']}' not found in database"}

            # Resolve product
            await cur.execute(
                "SELECT product_id, sku_name, buy_price FROM products "
                "WHERE sku_name LIKE %s AND is_active=1 LIMIT 1",
                (f"%{po_data['sku_name']}%",),
            )
            product = await cur.fetchone()
            if not product:
                return {"success": False, "error": f"Product '{po_data['sku_name']}' not found in database"}

            qty = int(po_data.get("quantity", 0))
            if qty <= 0:
                return {"success": False, "error": "Quantity must be greater than 0"}

            unit_price = float(po_data.get("unit_price") or product["buy_price"])
            total_value = qty * unit_price

            # Generate unique PO number
            await cur.execute("SELECT COUNT(*) AS cnt FROM purchase_orders")
            cnt = (await cur.fetchone())["cnt"]
            po_number = f"PO-{datetime.date.today().strftime('%Y%m%d')}-{cnt + 1:03d}"

            expected_date = po_data.get("expected_date") or (
                datetime.date.today() + datetime.timedelta(days=7)
            ).isoformat()

            notes = po_data.get("notes") or "Created via InvenIQ AI Assistant"

            await cur.execute("""
                INSERT INTO purchase_orders
                    (po_number, supplier_id, po_date, expected_date, status, total_value, notes)
                VALUES (%s, %s, %s, %s, 'OPEN', %s, %s)
            """, (
                po_number,
                supplier["supplier_id"],
                datetime.date.today().isoformat(),
                expected_date,
                total_value,
                notes,
            ))
            po_id = cur.lastrowid

            await cur.execute("""
                INSERT INTO po_items (po_id, product_id, qty_ordered, qty_received, unit_price)
                VALUES (%s, %s, %s, 0, %s)
            """, (po_id, product["product_id"], qty, unit_price))

            await conn.commit()

    return {
        "success": True,
        "po_number": po_number,
        "supplier": supplier["supplier_name"],
        "sku": product["sku_name"],
        "quantity": qty,
        "unit_price": unit_price,
        "total_value": total_value,
        "expected_date": expected_date,
    }


async def create_grn(pool: aiomysql.Pool, grn_data: dict) -> dict:
    """Create a new GRN record in the database."""
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:

            # Resolve supplier
            await cur.execute(
                "SELECT supplier_id, supplier_name FROM suppliers "
                "WHERE supplier_name LIKE %s AND is_active=1 LIMIT 1",
                (f"%{grn_data['supplier_name']}%",),
            )
            supplier = await cur.fetchone()
            if not supplier:
                # Insert as a new supplier for demo/new-industry flow
                await cur.execute(
                    "INSERT INTO suppliers (supplier_name, contact_person, is_active) VALUES (%s, %s, 1)",
                    (grn_data['supplier_name'], grn_data.get('received_by', 'TBD')),
                )
                supplier_id = cur.lastrowid
                supplier_name = grn_data['supplier_name']
            else:
                supplier_id = supplier["supplier_id"]
                supplier_name = supplier["supplier_name"]

            # Optionally resolve PO
            po_id = None
            if grn_data.get("po_number"):
                await cur.execute(
                    "SELECT po_id FROM purchase_orders WHERE po_number=%s LIMIT 1",
                    (grn_data["po_number"],),
                )
                po_row = await cur.fetchone()
                if po_row:
                    po_id = po_row["po_id"]

            # Generate unique GRN number
            await cur.execute("SELECT COUNT(*) AS cnt FROM grn")
            cnt = (await cur.fetchone())["cnt"]
            grn_number = f"GRN-{datetime.date.today().strftime('%Y%m%d')}-{cnt + 1:03d}"

            invoice_value = float(grn_data.get("invoice_value") or 0)
            grn_value = float(grn_data.get("grn_value") or invoice_value)
            discrepancy = round(abs(invoice_value - grn_value), 2)
            match_status = (
                "MATCH" if discrepancy < 1
                else "MISMATCH" if discrepancy > 0
                else "PENDING"
            )

            received_date = grn_data.get("received_date") or datetime.date.today().isoformat()
            notes = grn_data.get("notes") or "Created via InvenIQ"

            await cur.execute("""
                INSERT INTO grn
                    (grn_number, po_id, supplier_id, received_date,
                     invoice_value, grn_value, match_status, discrepancy_amt, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                grn_number, po_id, supplier_id, received_date,
                invoice_value, grn_value, match_status, discrepancy, notes,
            ))
            await conn.commit()

    return {
        "success": True,
        "grn_number": grn_number,
        "supplier": supplier_name,
        "po_number": grn_data.get("po_number") or "—",
        "invoice_value": invoice_value,
        "grn_value": grn_value,
        "match_status": match_status,
        "discrepancy_amt": discrepancy,
        "received_date": received_date,
    }


async def get_quotations(pool: aiomysql.Pool, industry: str = "all") -> list:
    """Fetch supplier quotations from DB, grouped by product. DB-first replacement for _mock_quotations()."""
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("""
                SELECT
                    p.product_id,
                    p.sku_name       AS item,
                    p.category,
                    p.unit,
                    p.buy_price      AS last_purchased_rate,
                    CASE
                        WHEN p.category IN ('Louvers','Operable Louvre System') THEN 'louvers'
                        ELSE 'laminates'
                    END              AS industry,
                    s.supplier_name  AS supplier,
                    q.rate,
                    q.freight_cost   AS freight,
                    q.lead_time_days,
                    q.moq,
                    q.valid_till,
                    q.reliability_pct,
                    q.notes,
                    q.is_last_purchased
                FROM quotations q
                JOIN products  p ON q.product_id  = p.product_id
                JOIN suppliers s ON q.supplier_id = s.supplier_id
                WHERE q.is_active = 1
                ORDER BY p.product_id, q.rate ASC
            """)
            rows = await cur.fetchall()

    # Group rows into per-product cards
    grouped: dict = {}
    for r in rows:
        pid = r["product_id"]
        if pid not in grouped:
            grouped[pid] = {
                "item": r["item"],
                "industry": r["industry"],
                "category": r["category"],
                "unit": r["unit"],
                "last_purchased_rate": float(r["last_purchased_rate"] or 0),
                "last_supplier": None,
                "quotes": [],
            }
        quote = {
            "supplier": r["supplier"],
            "rate": float(r["rate"] or 0),
            "freight": float(r["freight"] or 0),
            "lead_time": f"{r['lead_time_days']} days",
            "moq": int(r["moq"] or 1),
            "valid_till": str(r["valid_till"]) if r["valid_till"] else "",
            "reliability": float(r["reliability_pct"] or 90),
            "notes": r["notes"] or "",
        }
        grouped[pid]["quotes"].append(quote)
        if r["is_last_purchased"]:
            grouped[pid]["last_supplier"] = r["supplier"]

    items = list(grouped.values())

    # Fallback: if no is_last_purchased flag set, use lowest-rate supplier
    for item in items:
        if item["last_supplier"] is None and item["quotes"]:
            item["last_supplier"] = item["quotes"][0]["supplier"]

    if industry != "all":
        items = [i for i in items if i["industry"] == industry]

    return items


def _suggest_grn_action(notes: str) -> str:
    n = notes.lower()
    if any(w in n for w in ["grade", "quality", "wrong", "incorrect"]):
        return "Return & Reorder"
    if any(w in n for w in ["short", "quantity", "less"]):
        return "Raise Credit Note"
    if any(w in n for w in ["price", "rate", "mismatch", "invoice"]):
        return "Block Payment"
    return "Investigate & Resolve"
