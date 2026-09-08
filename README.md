# Dobra 

Build the foundation for a food delivery app called "Dobra".

BRANDING:

- Primary color: yellow (#FFD100 or similar warm golden yellow — use this as the main background/accent color)

- Logo text style: bold red script/cursive wordmark reading "Dobra"

- Secondary/text color: dark charcoal or black for readability against yellow

- Clean, modern, friendly delivery-app aesthetic (similar to Uber Eats / Glovo layout patterns)

APP STRUCTURE:

This is a single app that serves three types of users: Customer, Vendor (restaurant), and Driver.

1. Landing/entry screen: 

   - Show the Dobra logo and a simple role selector: "I'm a Customer" / "I'm a Vendor" / "I'm a Driver"

   - Below role selection, standard Sign Up / Log In options

2. Auth flow:

   - Use Supabase Auth for email/password sign up and login

   - After signup, store the selected role in a `users` table with fields: id, email, full_name, role (customer/vendor/driver), country, created_at

   - After login, route the user based on their role:

     - customer → Customer Home

     - vendor → Vendor Dashboard (show "pending approval" state if not yet approved)

     - driver → Driver Home (show "pending approval" state if not yet approved)

3. Placeholder home screens for each role (just basic layout for now, we'll build features next):

   - Customer Home: header with logo, search bar placeholder, "Restaurants near you" section placeholder

   - Vendor Dashboard: header, "Your Orders" placeholder, "Menu" placeholder

   - Driver Home: header, "Available Deliveries" placeholder, "My Earnings" placeholder

4. Set up Supabase Row Level Security so:

   - Users can only view/edit their own user record

   - Vendors will later only see their own restaurant's data

   - Drivers will later only see orders assigned to them

Keep the design simple and clean at this stage — we'll build out full functionality screen by screen after this foundation is working.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dobra-delivery-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/97c48d84-6cb7-49c1-8422-6dbf9f32e9a0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
