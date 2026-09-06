
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS cuisine text,
  ADD COLUMN IF NOT EXISTS rating numeric(2,1) NOT NULL DEFAULT 4.5,
  ADD COLUMN IF NOT EXISTS eta_minutes integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0;

-- Drivers can see and claim unassigned deliveries that are ready
CREATE POLICY "Drivers view unassigned ready orders"
  ON public.orders FOR SELECT TO authenticated
  USING (driver_id IS NULL AND status = 'ready' AND public.has_role(auth.uid(), 'driver'));

CREATE POLICY "Drivers claim unassigned ready orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (driver_id IS NULL AND status = 'ready' AND public.has_role(auth.uid(), 'driver'))
  WITH CHECK (driver_id = auth.uid());

-- Sample data -------------------------------------------------------------
INSERT INTO public.drivers (id, vehicle_type, status, country)
VALUES ('c28ea769-b73b-4f84-b525-cdf510d0ace0', 'bike', 'available', 'Poland')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.restaurants (id, owner_id, name, cuisine, country, city, status, logo_url, rating, eta_minutes, delivery_fee)
VALUES
 ('11111111-1111-4111-8111-000000000001','4543c147-d03e-47a8-b462-1a68ee4f570f','Forno Rosso','Pizza · Italian','Poland','Warsaw','approved','/__l5e/assets-v1/c5c9a829-4ba8-4028-a806-c08835558d3b/r1.jpg',4.8,25,6.90),
 ('11111111-1111-4111-8111-000000000002','4543c147-d03e-47a8-b462-1a68ee4f570f','Sakura Sushi Bar','Sushi · Japanese','Poland','Warsaw','approved','/__l5e/assets-v1/2e2357cb-6b13-4d66-a47c-05fb108f2ea6/r2.jpg',4.7,35,8.90),
 ('11111111-1111-4111-8111-000000000003','4543c147-d03e-47a8-b462-1a68ee4f570f','Bold Burger Co.','Burgers · American','Poland','Krakow','approved','/__l5e/assets-v1/06a8e3e2-288f-4076-8ed5-1dbf648137ce/r3.jpg',4.6,20,5.90),
 ('11111111-1111-4111-8111-000000000004','4543c147-d03e-47a8-b462-1a68ee4f570f','Babcia Zosia','Polish · Home cooking','Poland','Krakow','approved','/__l5e/assets-v1/8dce4300-9eb2-4ce9-ae7f-b40c1793a07c/r4.jpg',4.9,30,4.90),
 ('11111111-1111-4111-8111-000000000005','4543c147-d03e-47a8-b462-1a68ee4f570f','Green Bowl Kitchen','Healthy · Bowls','Poland','Gdansk','approved','/__l5e/assets-v1/b5d63f0b-88df-449b-b4fa-80a32dede839/r5.jpg',4.5,25,5.50),
 ('11111111-1111-4111-8111-000000000006','4543c147-d03e-47a8-b462-1a68ee4f570f','Cukiernia Kawa','Desserts · Coffee','Poland','Gdansk','approved','/__l5e/assets-v1/3ab034db-3b4b-4d10-b667-dc9488a1b8e0/r6.jpg',4.8,20,4.50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menu_items (id, restaurant_id, name, price, currency, image_url, available)
VALUES
 ('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-000000000001','Margherita Pizza',34.00,'PLN','/__l5e/assets-v1/f9cf6103-c463-48c6-88e2-19fcedfca98b/d1.jpg',true),
 ('22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-000000000001','Pepperoni Pizza',42.00,'PLN','/__l5e/assets-v1/c2aaf292-2ba1-4c14-94dc-b06b5aebe20d/d2.jpg',true),
 ('22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-000000000002','Salmon Nigiri Set (8 pcs)',59.00,'PLN','/__l5e/assets-v1/7c19ba1d-227c-4a9b-bddc-68de0aeb1de6/d3.jpg',true),
 ('22222222-2222-4222-8222-000000000004','11111111-1111-4111-8111-000000000002','Dragon Maki Roll',49.00,'PLN','/__l5e/assets-v1/5c7242a3-a0f5-4883-9061-425c994eab59/d4.jpg',true),
 ('22222222-2222-4222-8222-000000000005','11111111-1111-4111-8111-000000000003','Double Cheeseburger',39.00,'PLN','/__l5e/assets-v1/c318fc78-5ddd-4bcc-af28-2730c72cc1d7/d5.jpg',true),
 ('22222222-2222-4222-8222-000000000006','11111111-1111-4111-8111-000000000003','Crispy Chicken Burger',35.00,'PLN','/__l5e/assets-v1/0690a396-b5a0-4ceb-8f29-87b7e5617877/d6.jpg',true),
 ('22222222-2222-4222-8222-000000000007','11111111-1111-4111-8111-000000000004','Pierogi Ruskie (9 pcs)',29.00,'PLN','/__l5e/assets-v1/d18ac446-16f9-4da8-b848-273fe0f70c62/d7.jpg',true),
 ('22222222-2222-4222-8222-000000000008','11111111-1111-4111-8111-000000000004','Zurek in Bread Bowl',26.00,'PLN','/__l5e/assets-v1/7dfd2211-d214-46aa-a3d3-a360ea48d4fa/d8.jpg',true),
 ('22222222-2222-4222-8222-000000000009','11111111-1111-4111-8111-000000000005','Grilled Chicken Quinoa Bowl',37.00,'PLN','/__l5e/assets-v1/c00b9f07-7e87-4472-8356-da0ede0de7dd/d9.jpg',true),
 ('22222222-2222-4222-8222-00000000000a','11111111-1111-4111-8111-000000000005','Avocado Green Salad',31.00,'PLN','/__l5e/assets-v1/353c6804-c198-4a0e-beef-a32d4b5c5ef3/d10.jpg',true),
 ('22222222-2222-4222-8222-00000000000b','11111111-1111-4111-8111-000000000006','Chocolate Layer Cake',19.00,'PLN','/__l5e/assets-v1/b931b7e1-4bd0-4b68-929e-79e465f3a035/d11.jpg',true),
 ('22222222-2222-4222-8222-00000000000c','11111111-1111-4111-8111-000000000006','Cappuccino & Croissant',22.00,'PLN','/__l5e/assets-v1/7176187a-71e2-4194-b961-6e9ebea87eec/d12.jpg',true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.orders (id, customer_id, restaurant_id, driver_id, status, country, currency, total, created_at)
VALUES
 ('33333333-3333-4333-8333-000000000001','542c64d4-3d33-42bc-9fed-40622419bdc0','11111111-1111-4111-8111-000000000001',NULL,'pending','Poland','PLN',76.00, now() - interval '12 minutes'),
 ('33333333-3333-4333-8333-000000000002','542c64d4-3d33-42bc-9fed-40622419bdc0','11111111-1111-4111-8111-000000000001',NULL,'preparing','Poland','PLN',34.00, now() - interval '35 minutes'),
 ('33333333-3333-4333-8333-000000000003','542c64d4-3d33-42bc-9fed-40622419bdc0','11111111-1111-4111-8111-000000000004',NULL,'ready','Poland','PLN',55.00, now() - interval '50 minutes'),
 ('33333333-3333-4333-8333-000000000004','542c64d4-3d33-42bc-9fed-40622419bdc0','11111111-1111-4111-8111-000000000002','c28ea769-b73b-4f84-b525-cdf510d0ace0','picked_up','Poland','PLN',108.00, now() - interval '2 hours'),
 ('33333333-3333-4333-8333-000000000005','542c64d4-3d33-42bc-9fed-40622419bdc0','11111111-1111-4111-8111-000000000003','c28ea769-b73b-4f84-b525-cdf510d0ace0','delivered','Poland','PLN',74.00, now() - interval '1 day'),
 ('33333333-3333-4333-8333-000000000006','542c64d4-3d33-42bc-9fed-40622419bdc0','11111111-1111-4111-8111-000000000006','c28ea769-b73b-4f84-b525-cdf510d0ace0','delivered','Poland','PLN',41.00, now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, menu_item_id, quantity, price)
VALUES
 ('33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000001',1,34.00),
 ('33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000002',1,42.00),
 ('33333333-3333-4333-8333-000000000002','22222222-2222-4222-8222-000000000001',1,34.00),
 ('33333333-3333-4333-8333-000000000003','22222222-2222-4222-8222-000000000007',1,29.00),
 ('33333333-3333-4333-8333-000000000003','22222222-2222-4222-8222-000000000008',1,26.00),
 ('33333333-3333-4333-8333-000000000004','22222222-2222-4222-8222-000000000003',1,59.00),
 ('33333333-3333-4333-8333-000000000004','22222222-2222-4222-8222-000000000004',1,49.00),
 ('33333333-3333-4333-8333-000000000005','22222222-2222-4222-8222-000000000005',1,39.00),
 ('33333333-3333-4333-8333-000000000005','22222222-2222-4222-8222-000000000006',1,35.00),
 ('33333333-3333-4333-8333-000000000006','22222222-2222-4222-8222-00000000000b',1,19.00),
 ('33333333-3333-4333-8333-000000000006','22222222-2222-4222-8222-00000000000c',1,22.00);
