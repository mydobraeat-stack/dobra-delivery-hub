create or replace function public.public_restaurants()
returns table (id uuid, name text, cuisine text, city text, logo_url text, eta_minutes integer, delivery_fee numeric, rating numeric, featured boolean, is_open boolean)
language sql stable security definer set search_path = public
as $$
  select r.id, r.name, r.cuisine, r.city, r.logo_url, r.eta_minutes, r.delivery_fee, r.rating, r.featured, r.is_open
  from public.restaurants r
  where r.status = 'approved'
  order by r.featured desc, r.rating desc, r.name
$$;
revoke all on function public.public_restaurants() from public;
grant execute on function public.public_restaurants() to anon, authenticated;