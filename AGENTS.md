<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Admin actions that change orders/accounts/money run as SECURITY DEFINER RPCs (admin_*) that check private.is_staff()/is_platform_admin() and write admin_audit_log; why: one audited, role-checked path.
- Pricing (fees, minimums, package rates, currency) lives in country_pricing/cities tables, never hardcoded; why: admin-configurable per market.
- Admin levels: role 'admin' = Super Admin, 'support_agent' = orders/disputes/support/reviews only; why: least privilege.
- Admin presentation uses a shared desktop sidebar/mobile navigation drawer and admin-scoped layout rules; why: every staff page stays usable on narrow screens without affecting customer, vendor, or driver layouts.
- Admin order controls mirror database-enforced rules through src/lib/admin-rules.ts; manual progression is Super Admin-only, forward one stage, and closed orders stay locked; why: UI affordances must not bypass audited RPC safeguards.
- Company legal/contact details live only in src/lib/company.ts; public pages and legal texts read them (legal texts via {NIP}/{KRS}/{REGON}/{EMAIL}/{PHONE} tokens filled by fillCompany). Empty fields are never rendered; why: enter details once, no placeholders on the live site.
- Public-site copy (policy pages, landing, contact) lives in src/components/marketing/site-copy.ts in all 4 languages; why: one place to translate and review.
- Other users' phone numbers are only returned by the get_call_number RPC (order customer/driver while active, or staff), which logs each call to call_logs; never expose profiles.phone or order_contacts through other policies; why: GDPR data minimisation.
- Google Maps navigation links and the auto-open setting live only in src/lib/navigation.ts, opened synchronously inside tap handlers; why: browsers block popups opened after an await.
- Checkout manual address formatting and completeness checks share a browser-safe helper; why: displayed address fields and submitted delivery addresses must stay consistent.
- Payout math lives only in src/lib/payout.ts; the per-order driver payout is locked by DB trigger at insert from country_pricing; why: rate changes never rewrite past earnings.
- Cash driver payouts are immutable, audited Super Admin RPC records with currency-scoped locking and idempotency; settled cash already retains the driver's locked earnings, and those retained amounts must never be paid twice. Cash balance summaries use all delivered orders, not the dashboard's limited order list; why: prevent overpayment and inaccurate cash availability.
- Order status-change times (accepted_at…cancelled_at, delivered_at) are set only by database triggers and shown via src/lib/order-time.ts in the order's country timezone; why: trustworthy timeline, consistent 24h local display.
