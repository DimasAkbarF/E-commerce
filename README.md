# FoodStore

A modern e-commerce web application for food marketplace built with Next.js 14, Supabase, and Tailwind CSS.

## Overview

FoodStore is a full-stack e-commerce platform that enables users to browse food products, manage shopping carts, place orders, and allows admins to manage products and monitor sales through an analytics dashboard.

## Features

### User Features
- Browse food products by categories (Snacks, Drinks, Dessert, Heavy Meals, Seafood, Vegetables, Fruits, Frozen Food)
- Search products with real-time filtering
- Add products to cart with quantity management
- Checkout with order summary and payment simulation
- View order history with status tracking (Pending, Processing, Completed, Rejected)
- Responsive design for mobile and desktop

### Admin Features
- Admin dashboard with real-time analytics
- Revenue tracking and order statistics
- Order management with status updates
- View all user orders with filtering capabilities
- Charts for revenue trends and order status distribution

### Technical Features
- Isolated session management per browser tab
- Role-based access control (User vs Admin)
- Real-time order status updates via Supabase Realtime
- Responsive UI with Tailwind CSS
- Toast notifications for user feedback
- Multi-tab session isolation (no cross-tab session bleeding)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with credentials provider
- **State Management**: React Context (Cart, Toast)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React (SVG-based)

## Project Structure

```
app/
├── page.tsx                    # Home page with promotions and categories
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── admin/
│   ├── layout.tsx              # Admin layout with role protection
│   ├── page.tsx                # Admin dashboard redirect
│   ├── dashboard/
│   │   └── AdminDashboardClient.tsx  # Dashboard with analytics
│   └── orders/
│       └── page.tsx            # Order management page
├── orders/
│   └── page.tsx                # User order history
├── cart/
│   └── page.tsx                # Shopping cart
├── checkout/
│   └── page.tsx                # Checkout process
├── login/
│   └── page.tsx                # Login page
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts         # NextAuth API route

components/
├── layout/
│   ├── Navbar.tsx              # Navigation with cart count
│   ├── Footer.tsx              # Site footer
│   └── Sidebar.tsx             # Admin sidebar
├── sections/
│   ├── Hero.tsx                # Hero banner section
│   ├── Categories.tsx          # Category grid
│   ├── BestSellerSection.tsx   # Featured products
│   └── Promotions.tsx          # Promo banners
├── product/
│   ├── ProductCard.tsx         # Product display card
│   └── ProductGrid.tsx         # Product grid layout
├── cart/
│   └── CartItem.tsx            # Cart item component
├── checkout/
│   ├── CheckoutForm.tsx        # Customer info form
│   ├── OrderSummary.tsx        # Order summary display
│   └── PaymentInfo.tsx         # Payment instructions
├── admin/
│   ├── AdminCharts.tsx         # Chart components
│   └── AdminSkeletons.tsx      # Loading skeletons
├── providers/
│   └── AuthProvider.tsx        # NextAuth provider wrapper
└── ui/
    ├── Button.tsx              # Reusable button
    ├── Input.tsx               # Form inputs
    └── Toast.tsx               # Toast notifications

hooks/
├── useIsolatedSession.ts       # Isolated session per tab
├── useCart.ts                  # Cart state management
└── useToast.ts                 # Toast notifications

lib/
├── auth.ts                     # NextAuth configuration
├── cart.ts                     # Cart utilities
├── orders.ts                   # Order CRUD operations
├── products.ts                 # Product fetching
├── supabase.ts                 # Supabase client
└── utils.ts                    # Utility functions

types/
└── index.ts                    # TypeScript interfaces

public/
└── images/                     # Static images
```

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/foodstore.git
cd foodstore
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get your Supabase credentials from the Supabase Dashboard:
- Go to Project Settings > API
- Copy `Project URL` and `anon public`

Generate a random secret for NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Set Up Database

Go to Supabase SQL Editor and run the following SQL:

```sql
-- ============================================
-- E-COMMERCE DATABASE SCHEMA
-- ============================================

-- 1. USERS TABLE (for role management)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON users;
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE users;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

-- 2. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  image_url TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Allow all" ON cart_items;
DROP POLICY IF EXISTS "Allow all" ON orders;
DROP POLICY IF EXISTS "Allow all" ON order_items;

CREATE POLICY "Allow all" ON cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;
```

### 5. Seed Initial Users

Run this SQL to create the default admin and user accounts:

```sql
-- Insert Admin (matches NextAuth mock data)
INSERT INTO users (id, email, name, role) 
VALUES ('1', 'admin@foodstore.com', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert User (matches NextAuth mock data)
INSERT INTO users (id, email, name, role) 
VALUES ('2', 'user@example.com', 'John Doe', 'user')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Verify
SELECT * FROM users;
```

Default login credentials:
- **Admin**: admin@foodstore.com / admin123
- **User**: user@example.com / user123

### 6. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Implementation Details

### Isolated Session Management

The application implements a custom `useIsolatedSession` hook that creates a snapshot of the user session at mount time. This ensures:

- Each browser tab maintains its own session state
- No cross-tab session bleeding (logging in on one tab does not affect other tabs)
- Role is always fetched fresh from the database on page load
- Proper loading states prevent premature access control decisions

### Authentication Flow

1. User logs in via credentials (NextAuth)
2. Session is stored in JWT
3. On each page load, `useIsolatedSession` fetches the current user role from Supabase
4. Access control is applied based on the fetched role

### Order Status Workflow

1. **Pending**: Order just created, awaiting admin review
2. **Processing**: Admin has accepted the order and is preparing it
3. **Completed**: Order is finished and delivered
4. **Rejected**: Admin rejected the order (invalid payment, out of stock, etc.)

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel Dashboard:
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (set to your production URL)
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy

### Environment Variables for Production

```env
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### "Could not find the table 'public.users'"

Run the database setup SQL in Supabase SQL Editor to create the users table.

### Role not detected after login

1. Ensure users exist in both:
   - `lib/auth.ts` (mock data for NextAuth)
   - Supabase `users` table
2. Check that user IDs match between both sources
3. Hard refresh the page (Ctrl+F5)

### Session bleeding between tabs

This is expected behavior when using the same browser session. For complete isolation:
- Use different browsers (Chrome vs Firefox)
- Or use Incognito mode for one tab

### Realtime not working

Ensure tables are added to Supabase Realtime publication:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

## Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm start            # Start production server

# Lint
npm run lint         # Run ESLint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Next.js and Supabase
- UI components styled with Tailwind CSS
- Charts powered by Recharts
- Icons from Lucide React

## Contact

For questions or support, please open an issue on GitHub.
