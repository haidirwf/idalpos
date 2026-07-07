# IDAL POS 🍴

**IDAL POS** adalah sistem pemesanan meja mandiri berbasis QR-Code (Self-Ordering) dan dashboard Point of Sale (POS) admin terpadu yang dirancang menggunakan Next.js 15, React 19, dan Supabase. Sistem ini memberikan pengalaman pemesanan mandiri yang super cepat (*instant & seamless*) bagi pelanggan, serta pipeline manajemen pesanan yang andal bagi restoran.

---

## 🌟 Fitur Utama

### Sisi Pelanggan (Customer Self-Ordering)
1. **Pindai QR Meja (Client-Side Scanner):** Scanner kamera bawaan di web menggunakan `html5-qrcode` untuk memindai kode QR meja secara langsung tanpa aplikasi tambahan.
2. **Menu Dinamis & Responsif:** Pemilihan hidangan, filter kategori cepat, pencarian menu, dan penambahan catatan kustom (contoh: *pedas*, *es sedikit*). Dioptimalkan dengan `useMemo` untuk performa interaksi 0ms.
3. **Keranjang Belanja Lokal (Cart Store):** Manajemen item keranjang belanja menggunakan state manager `Zustand` yang terpersistensi di browser.
4. **Panel "Pesanan Saya" (My Orders):** Panel collapsible (bottom sheet drawer) di halaman menu untuk melihat daftar pesanan aktif di meja tersebut dan memantau statusnya secara realtime.
5. **Timeline Pelacakan Live (Live Tracking):** Halaman linimasa vertikal interaktif yang terhubung langsung ke database lewat Supabase Realtime Subscription untuk memantau status makanan (*Menunggu -> Diterima -> Dimasak -> Siap -> Disajikan*).

### Sisi Administrasi (Admin POS Dashboard)
1. **Orders POS Pipeline (Kanban Board):** Manajemen pesanan dalam bentuk papan Kanban 5 kolom (*Menunggu, Diterima, Dimasak, Siap, Disajikan*). Dilengkapi dengan transisi kartu instan (*0ms latency*) dan notifikasi suara (chime) otomatis ketika ada pesanan baru masuk.
2. **Unifikasi Pengelolaan Menu & Kategori:** Manajemen produk hidangan (CRUD) dan kategori disatukan dalam satu halaman tabbed terpadu di `/admin/menu` untuk menghemat ruang navigasi.
3. **Laporan Penjualan (Daily Sales Report):** Ringkasan keuangan harian, jumlah pesanan, nilai transaksi rata-rata, dan tabel histori transaksi lunas yang diperbarui secara langsung.
4. **Manajemen Meja & Cetak QR:** CRUD meja restoran dan generate otomatis QR Code Meja yang terintegrasi dengan URL pemesanan mandiri.
5. **Keamanan Rute (Edge Middleware):** Proteksi halaman admin (`/admin/*`) menggunakan Next.js Middleware dan `@supabase/ssr` berbasis cookie session.

---

## 🛠️ Tech Stack

* **Framework Utama:** [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
* **Styling & UI:** Vanilla CSS & [Tailwind CSS v4](https://tailwindcss.com/)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Realtime Channel, Supabase SSR Auth)
* **Icons:** [Lucide React](https://lucide.dev/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Testing Suite:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/) (69 Tests Passed)
* **Client-Side Scanner:** [html5-qrcode](https://github.com/mebjas/html5-qrcode)

---

## 🚀 Memulai Instalasi Lokal

### 1. Prasyarat
Pastikan Anda telah menginstal **Node.js (v18+)** dan memiliki akun **Supabase**.

### 2. Kloning Repositori
```bash
git clone https://github.com/haidirwf/idalpos.git
cd idalpos
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env.local` di direktori root proyek dan masukkan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Migrasi Database Supabase
Jalankan skrip migrasi SQL yang berada di dalam folder `supabase/migrations/` ke SQL Editor di dashboard Supabase Anda:
* [schema.sql](file:///home/idal/sekolajh/idalpos/supabase/migrations/schema.sql): Membuat skema tabel (`tables`, `categories`, `products`, `orders`, `order_items`) beserta kebijakan RLS (Row Level Security).

### 5. Jalankan Halaman Development
Instal dependensi dan jalankan server pengembangan lokal:
```bash
npm install
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🧪 Menjalankan Pengujian (Testing)

Proyek ini dilengkapi dengan 69 unit & integration tests yang memvalidasi server actions, store keranjang belanja, Next.js middleware, dan fungsionalitas rendering komponen.

Untuk menjalankan suite pengujian:
```bash
# Menjalankan test dalam mode watch
npm run test

# Menjalankan test sekali jalan (CI mode)
npm run test:run
```

---

## ☁️ Panduan Deploy Vercel

1. Hubungkan repositori GitHub `haidirwf/idalpos` Anda ke **Vercel**.
2. Di bagian **Environment Variables** proyek Vercel, masukkan dua kunci berikut:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Klik **Deploy**. Variabel ini akan otomatis diinjeksi saat Next.js membangun static & dynamic pages di server Vercel.

---

## 📂 Struktur Direktori Penting

```txt
├── app/
│   ├── admin/                # Rute Admin (Orders, Menu, Tables, Laporan)
│   ├── login/                # Halaman Login Admin & Auth Actions
│   ├── table/                # Rute Pelanggan (Menu, Keranjang, Live Tracker)
│   └── page.tsx              # Portal Utama POS (Pindai QR)
├── components/
│   └── customer/             # Komponen Pelanggan (QR Scanner Modal, Alert Status)
├── lib/
│   ├── actions/              # Server Actions (Mutasi DB Admin & Orders)
│   ├── store/                # Zustand Cart Store
│   └── supabase/             # Inisialisasi Klien SSR & Browser Supabase
├── supabase/
│   └── migrations/           # Skema Migrasi Database PostgreSQL
```

---
Dibuat dengan 🍴 dan dedikasi untuk industri F&B modern.
