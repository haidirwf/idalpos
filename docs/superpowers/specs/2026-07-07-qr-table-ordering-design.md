# QR Table Ordering & POS Web App - v1.1 (MVP)
## Design Specification

**Date:** July 7, 2026  
**Status:** Approved  
**Author:** Antigravity (AI Coding Assistant)  

---

## 1. Executive Summary

This document describes the architecture, database schema, and design patterns for the **QR Table Ordering & POS Web App**. The app allows customers to scan a table-specific QR Code, view a rich food/beverage menu, place orders, and track their order status in realtime without logging in. Admins (cashiers/managers) log in to a secure dashboard to manage categories, products, tables, and transition orders through their lifecycle (Pending -> Accepted -> Cooking -> Ready -> Served -> Paid) in realtime.

---

## 2. Directory Structure

The project is built on Next.js 15 with App Router, TypeScript, Tailwind CSS, and Supabase client-side JS.

```text
idalpos/
├── app/
│   ├── layout.tsx                # Global layout (providers, sonner toast UI, fonts)
│   ├── page.tsx                  # Home redirect logic (redirects to admin or displays default screen)
│   ├── table/
│   │   └── [tableNumber]/        # Customer landing
│   │       ├── page.tsx          # Landing / "Mulai Pesan" screen
│   │       ├── menu/             # Customer menu view (Category carousel, product cards)
│   │       │   └── page.tsx
│   │       ├── cart/             # Shopping cart sheet & customer details
│   │       │   └── page.tsx
│   │       └── tracking/         # Customer order tracking timeline
│   │           └── [orderId]/
│   │               └── page.tsx
│   ├── login/                    # Admin login page
│   │   └── page.tsx
│   └── admin/                    # Admin Dashboard (Protected by layout middleware)
│       ├── layout.tsx            # Protected layout (Sidebar, Navbar, Auth check)
│       ├── page.tsx              # Dashboard widgets (metrics, cards)
│       ├── orders/               # Realtime Order processing POS screen
│       │   └── page.tsx
│       ├── menu/                 # Product CRUD list & modals
│       │   └── page.tsx
│       ├── categories/           # Category CRUD list & modals
│       │   └── page.tsx
│       ├── tables/               # Table CRUD, Status, and QR Download
│       │   └── page.tsx
│       └── reports/              # Simple daily report dashboard
│           └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components (button, card, dialog, etc.)
│   ├── customer/                 # Customer-only layout modules
│   └── admin/                    # Admin-only dashboard components (Sidebar, stats)
├── hooks/                        # Custom React hooks (e.g., useSupabaseRealtime)
├── lib/
│   ├── supabase/                 # Supabase clients (client-side, server-side, and middleware)
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── store/                    # Zustand stores
│   │   └── cartStore.ts          # Client-side persisted shopping cart
│   └── utils.ts                  # Tailwind class merge helper, currency formatters
├── supabase/
│   └── migrations/
│       └── schema.sql            # Core database schema DDL & seeds
├── .env.example                  # Environment template
```

---

## 3. Database Schema

The PostgreSQL database is hosted on Supabase. Below is the DDL schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tables
CREATE TABLE tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50), -- Lucide-react icon identifier string (e.g. 'Coffee', 'Pizza')
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products (Menus)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  available BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID REFERENCES tables(id) ON DELETE RESTRICT NOT NULL,
  customer_name VARCHAR(100),
  notes TEXT,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cooking', 'ready', 'served', 'paid')),
  payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash')),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Order Items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price NUMERIC(12, 2) NOT NULL, -- Captures price at checkout time
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Database Indexes
To maintain response times below 2 seconds:
- Index on `products.category_id` (menu loading filter).
- Index on `orders.status` (admin pipeline display).
- Index on `orders.table_id` (table resolution).

---

## 4. Authentication & Security Policies (RLS)

Supabase RLS is configured to restrict write operations while permitting anonymous checkout:

* **Authentication:**
  - Authenticated path `/admin/*` is protected by Next.js middleware using `@supabase/ssr` to verify JWT.
  - Non-authenticated routes `/table/[tableNumber]/*` are accessible by any customer.

* **Row Level Security (RLS) Rules:**
  - **`tables`, `categories`, `products`:**
    - `SELECT`: Public access allowed.
    - `INSERT/UPDATE/DELETE`: Restricted to authenticated admins.
  - **`orders`, `order_items`:**
    - `SELECT`: Allowed for public (requires matching the `order_id` in customer's local session) and authenticated admins.
    - `INSERT`: Public access allowed (Checkout).
    - `UPDATE`: Authenticated admins only (Updates status/payment status).
    - `DELETE`: Disallowed for all.

---

## 5. Realtime Synchronization & Application State

We leverage Supabase Realtime Channels to facilitate immediate, multi-client updates:

* **Customer Tracking Flow:**
  - The customer landing page saves the placed `orderId` to `localStorage` or queries it via URL.
  - The Tracking screen initiates a subscription to the `orders` table matching the specific `id`:
    ```typescript
    supabase
      .channel('order-tracking')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        // Update client status state dynamically
      })
      .subscribe()
    ```

* **Admin POS / Kitchen Board Flow:**
  - Admin subscribes to the entire `orders` table.
  - On `postgres_changes` event `INSERT`, a toast alert rings a sound notification and appends the new order card to the *Pending* column.
  - On `UPDATE`, the order's state transitions dynamically in the Kanban board.
  - Server Actions handle status progression (e.g. `updateOrderStatus(orderId, 'cooking')`).

---

## 6. Design System & User Interface

A premium visual layer is configured via Tailwind and customized CSS variables:

* **Typography:** Modern Outfit font.
* **Palette:**
  - *Customer:* Deep Charcoal backgrounds (`#0F0F10`), glowing golden amber headers (`#F59E0B`), warm light card surfaces (`#18181B`).
  - *Admin:* Deep dark navy (`#0B0F19`), rich border highlights (`#1F2937`), violet primary indicators (`#6366F1`), emerald green for success metrics.
* **Micro-interactions:**
  - Cart addition triggers a slight `bounce-up` animation.
  - Status updates in the tracker trigger standard CSS pulses.
  - Loading skeleton states mimic exact component sizes.
