# Dobra: sample photos and real data across all three sides

Right now the customer, restaurant and driver screens show grey placeholder boxes. This fills them with realistic sample restaurants, dishes, orders and photos, and connects each screen to the real data instead of dummy blocks.

## Photos

Generate a set of appetising, realistic images and host them so every screen can use them:

- 6 restaurant cover/logo photos (pizza place, sushi bar, burger joint, Polish home cooking, salad/bowls, dessert & coffee)
- 12 dish photos (2 per restaurant)
- 1 map-style background for the driver delivery cards
- 1 food-spread banner for the customer home

## Sample data

Add sample rows to the existing tables so the three test accounts see a live app:

- 6 approved restaurants, one owned by the vendor test account, with city, country and photo
- 12 menu items with names, prices in the right currency, availability and photos
- 5 orders across statuses (pending, preparing, ready, picked up, delivered) linking the customer test account, the vendor's restaurant and the driver test account, with their line items
- A driver record for the driver test account (vehicle type, status, country)

## Screen updates

**Customer home**
- Working search box that filters restaurants and dishes by name
- "Restaurants near you" grid showing real photos, name, city, cuisine-style tagline, price range
- Tapping a restaurant opens its page with the menu (dish photo, name, price, availability)
- "Your orders" section listing the customer's own orders with status

**Restaurant dashboard**
- "Your orders" list: order number, items, total, status, with buttons to move an order forward (accept → preparing → ready)
- "Menu" list with dish photos, prices and an availability toggle
- Restaurant header showing its own photo, name and city

**Driver home**
- "Available deliveries" listing orders that are ready and unassigned, with restaurant photo, pickup city and payout; a button to accept one
- "My deliveries" showing accepted orders with a button to mark picked up / delivered
- "My earnings" totalling delivered orders

Pending vendors and drivers keep seeing the approval screen.

## Technical notes

- Images are generated and uploaded via the assets CDN; their URLs are stored in `restaurants.logo_url` and `menu_items.image_url` through a seed migration containing literal INSERT statements (schema stays unchanged apart from any missing column such as a restaurant tagline/cuisine).
- Data access uses the browser Supabase client with TanStack Query, respecting existing RLS: customers read approved restaurants and their own orders; vendors read/write their own restaurant, menu and orders; drivers read unassigned ready orders and their own assigned orders.
- A policy addition is needed so drivers can see and claim unassigned `ready` orders (current policy only exposes orders where `driver_id` already matches).
- New route files: restaurant detail page under the authenticated area; shared order/status helpers in `src/lib`.
