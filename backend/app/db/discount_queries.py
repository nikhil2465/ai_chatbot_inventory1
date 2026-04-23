"""
MySQL queries for the Distributor Discount Calculator.
Used by the /api/discounts REST endpoints.
Follows the same async aiomysql pattern as the rest of the project.
"""
import datetime
import aiomysql


async def get_discount_dashboard(pool: aiomysql.Pool) -> dict:
    """Return full discount dashboard: KPIs, rules, products, recent quotes."""
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:

            # Products with pricing (for the calculator dropdown)
            await cur.execute("""
                SELECT product_id, sku_name, category, buy_price, sell_price
                FROM products
                WHERE is_active = 1
                ORDER BY category, sku_name
            """)
            products = await cur.fetchall()

            # Discount rules (active only)
            # ISNULL() returns 1 for NULL rows — pushes NULLs (all-segment rules) to end
            await cur.execute("""
                SELECT rule_id, rule_name, segment, category,
                       min_qty, max_qty, discount_pct, min_margin_pct,
                       is_active, valid_from, valid_till, notes
                FROM discount_rules
                WHERE is_active = 1
                ORDER BY ISNULL(segment), segment,
                         ISNULL(category), category,
                         min_qty
            """)
            rules = await cur.fetchall()

            # KPI: avg discount + quote count (current month)
            await cur.execute("""
                SELECT
                    COUNT(*)                        AS quotes_this_month,
                    COALESCE(AVG(discount_pct), 0)  AS avg_discount_pct,
                    COALESCE(SUM(total_net), 0)      AS total_quoted_value,
                    COALESCE(AVG(margin_pct), 0)     AS avg_margin_pct
                FROM discount_quotes
                WHERE MONTH(created_at) = MONTH(CURDATE())
                  AND YEAR(created_at) = YEAR(CURDATE())
            """)
            kpi_row = await cur.fetchone()

            # KPI: acceptance rate
            await cur.execute("""
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted
                FROM discount_quotes
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
            """)
            accept_row = await cur.fetchone()

            # Recent quotes (last 30)
            await cur.execute("""
                SELECT quote_id, quote_number, customer_name, segment,
                       product_name, category, quantity,
                       sell_price, discount_pct, discount_amount, final_price,
                       total_gross, total_net, margin_pct, margin_amount,
                       rule_applied, status, notes, valid_till, created_at
                FROM discount_quotes
                ORDER BY created_at DESC
                LIMIT 30
            """)
            quotes = await cur.fetchall()

            # Segment summary (for the rules panel header cards)
            await cur.execute("""
                SELECT segment,
                       COUNT(*) AS quote_count,
                       COALESCE(AVG(discount_pct), 0) AS avg_discount,
                       COALESCE(SUM(total_net), 0) AS total_value
                FROM discount_quotes
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY segment
            """)
            seg_summary = await cur.fetchall()

        # Coerce Decimal / datetime for JSON serialisation
        for p in products:
            p['buy_price']  = float(p['buy_price'])
            p['sell_price'] = float(p['sell_price'])

        for r in rules:
            r['discount_pct']   = float(r['discount_pct'])
            r['min_margin_pct'] = float(r['min_margin_pct'])
            if r.get('valid_from'):
                r['valid_from'] = r['valid_from'].isoformat()
            if r.get('valid_till'):
                r['valid_till'] = r['valid_till'].isoformat()

        for q in quotes:
            for f in ('sell_price', 'discount_pct', 'discount_amount', 'final_price',
                      'total_gross', 'total_net', 'margin_pct', 'margin_amount'):
                if q.get(f) is not None:
                    q[f] = float(q[f])
            if q.get('created_at'):
                q['created_at'] = q['created_at'].isoformat()
            if q.get('valid_till'):
                q['valid_till'] = q['valid_till'].isoformat()

        total_q   = accept_row['total'] or 0
        accepted  = accept_row['accepted'] or 0
        accept_rt = round(accepted / total_q * 100, 1) if total_q else 0

        return {
            "kpis": {
                "quotes_this_month":  int(kpi_row['quotes_this_month']),
                "avg_discount_pct":   round(float(kpi_row['avg_discount_pct']), 1),
                "total_quoted_value": round(float(kpi_row['total_quoted_value']), 0),
                "avg_margin_pct":     round(float(kpi_row['avg_margin_pct']), 1),
                "acceptance_rate":    accept_rt,
            },
            "products":        [dict(p) for p in products],
            "rules":           [dict(r) for r in rules],
            "quotes":          [dict(q) for q in quotes],
            "segment_summary": [dict(s) for s in seg_summary],
            "data_source":     "mysql",
        }


async def save_discount_quote(pool: aiomysql.Pool, quote: dict) -> dict:
    """Insert a new discount quote record. Returns the saved quote with generated number."""
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # Generate sequential quote number
            await cur.execute(
                "SELECT COUNT(*) AS cnt FROM discount_quotes WHERE DATE(created_at) = CURDATE()"
            )
            row   = await cur.fetchone()
            seq   = (row['cnt'] or 0) + 1
            today = datetime.date.today().strftime('%Y%m%d')
            q_num = f"DQ-{today}-{seq:03d}"

            valid_till = (
                datetime.date.today() + datetime.timedelta(days=7)
            ).isoformat()

            await cur.execute("""
                INSERT INTO discount_quotes
                  (quote_number, customer_name, segment, product_id, product_name,
                   category, quantity, buy_price, sell_price, discount_pct,
                   discount_amount, final_price, total_gross, total_net,
                   margin_pct, margin_amount, rule_applied, status, notes, valid_till)
                VALUES
                  (%s, %s, %s, %s, %s,
                   %s, %s, %s, %s, %s,
                   %s, %s, %s, %s,
                   %s, %s, %s, %s, %s, %s)
            """, (
                q_num,
                quote.get('customer_name'),
                quote['segment'],
                quote.get('product_id'),
                quote['product_name'],
                quote.get('category'),
                quote['quantity'],
                quote['buy_price'],
                quote['sell_price'],
                quote['discount_pct'],
                quote['discount_amount'],
                quote['final_price'],
                quote['total_gross'],
                quote['total_net'],
                quote['margin_pct'],
                quote['margin_amount'],
                quote.get('rule_applied'),
                'DRAFT',
                quote.get('notes'),
                valid_till,
            ))
            await conn.commit()
            return {"success": True, "quote_number": q_num, "valid_till": valid_till}


async def update_quote_status(pool: aiomysql.Pool, quote_id: int, status: str) -> dict:
    """Update quote status (DRAFT → SENT / ACCEPTED / REJECTED / EXPIRED)."""
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE discount_quotes SET status=%s WHERE quote_id=%s",
                (status, quote_id),
            )
            await conn.commit()
            return {"success": True, "quote_id": quote_id, "status": status}
