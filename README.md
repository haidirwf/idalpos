# IDAL POS 🍴

**IDAL POS** is a modern QR-Code based self-ordering system and integrated Point of Sale (POS) administration dashboard built with Next.js 15, React 19, and Supabase. It offers an instant, seamless self-ordering experience for customers, and a highly responsive, real-time pipeline management system for restaurant staff.

---

## 🌟 Key Features

### Customer Self-Ordering (Table Side)
1. **Client-Side QR Scanner:** Built-in web camera scanner using `html5-qrcode` to scan table QR codes directly on the mobile browser without requiring external app downloads.
2. **Dynamic & Responsive Menu:** Clean dishes list, fast category filtering, product search, and custom item note inputs (e.g., *extra spicy*, *less ice*). Highly optimized with `useMemo` for a 0ms lag-free mobile typing experience.
3. **Local Shopping Cart:** Persistent client-side cart management powered by `Zustand`.
4. **"My Orders" Live Panel:** Collapsible bottom-sheet drawer on the menu page allowing customers to view active order tickets for their table and track cooking stages.
5. **Real-time Tracking Timeline:** Interactive vertical status timeline connecting directly to the Supabase database via WebSockets (*Pending -> Accepted -> Cooking -> Ready -> Served*).

### Administration POS Dashboard
1. **Orders POS Pipeline (Kanban Board):** Live drag-and-drop or click-action Kanban board with 5 columns (*Pending, Accepted, Cooking, Ready, Served*). Features instant card transitions (*0ms latency*) and automatic audio chime notifications on incoming orders.
2. **Unified Menu & Category Management:** Tabbed control panel at `/admin/menu` consolidating both dish CRUD and food categories under a single page to streamline layouts.
3. **Daily Sales Reports:** Real-time metrics overview displaying daily gross revenue, total completed tickets, average order value, and transactional invoice history tables.
4. **Table & QR Code Manager:** CRUD for restaurant tables generating dynamic QR codes mapped directly to self-ordering table landing routes.
5. **Edge Session Middleware:** Route protection for `/admin/*` pages secured using cookie-based session verification via Next.js Middleware and `@supabase/ssr`.

---

## 🛠️ Tech Stack

* **Core Framework:** [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Database & Realtime:** [Supabase](https://supabase.com/) (PostgreSQL, Realtime WebSockets, Supabase SSR Auth)
* **Icons:** [Lucide React](https://lucide.dev/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Testing Suite:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/) (69 Tests Passing)
* **Camera Scanning:** [html5-qrcode](https://github.com/mebjas/html5-qrcode)

---

## 🚀 Getting Started (Local Setup)

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed and an active **Supabase** project database.

### 2. Clone the Repository
```bash
git clone https://github.com/haidirwf/idalpos.git
cd idalpos
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root folder and configure your Supabase API credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Database Migrations
Run the SQL migration script located in the `supabase/migrations/` directory inside your Supabase SQL Editor:
* [schema.sql](file:///home/idal/sekolajh/idalpos/supabase/migrations/schema.sql): Sets up tables (`tables`, `categories`, `products`, `orders`, `order_items`) along with Row Level Security (RLS) policies.

### 5. Start the Development Server
Install npm dependencies and launch the dev server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Running Unit Tests

This project includes 69 unit & integration tests validating server actions, cart store states, router middleware, and client component rendering behaviors.

To run the test suite:
```bash
# Run tests in hot-reload watch mode
npm run test

# Run tests once (CI mode)
npm run test:run
```

---

## ☁️ Vercel Deployment

1. Connect your GitHub repository `haidirwf/idalpos` to your **Vercel** account.
2. In the Vercel Project Settings, navigate to **Environment Variables** and add the following keys:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **Deploy**. Vercel will automatically load these environment variables to build static and server-rendered routes successfully.

---

## 📂 Project Directory Structure

```txt
├── app/
│   ├── admin/                # Admin Panel Routes (Orders, Menu, Tables, Reports)
│   ├── login/                # Admin Login Form & Auth Actions
│   ├── table/                # Table Side Client Routes (Menu, Cart, Live Tracker)
│   └── page.tsx              # Portal Home Screen (Scan QR)
├── components/
│   └── customer/             # Table-side UI Components (Scanner modal, Alert status)
├── lib/
│   ├── actions/              # Server Actions (Admin CRUD & POS order mutations)
│   ├── store/                # Zustand Cart Store state
│   └── supabase/             # SSR Client & Browser client initializations
├── supabase/
│   └── migrations/           # PostgreSQL Database Schema Migrations
```

---
Made with 🍴 and dedication to the modern F&B industry.
