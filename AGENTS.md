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
- Company legal/contact details live only in src/lib/company.ts; public pages and legal texts read them (legal texts via {NIP}/{KRS}/{REGON}/{EMAIL}/{PHONE} tokens filled by fillCompany). Empty fields are never rendered; why: enter details once, no placeholders on the live site.
- Public-site copy (policy pages, landing, contact) lives in src/components/marketing/site-copy.ts in all 4 languages; why: one place to translate and review.
