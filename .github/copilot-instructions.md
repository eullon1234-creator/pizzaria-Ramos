# Pizzaria Ramos - AI Coding Guide

## 🏗️ Architecture Overview

**Pizzaria Ramos** is a React + Vite pizza shop e-commerce site with admin dashboard and PIX payment integration.

### Core Structure
- **Frontend:** React 19 + React Router (SPA with 3 routes: `/`, `/admin`, `/admin/dashboard`)
- **Database:** Supabase (categories, products, product_prices, store_settings)
- **Styling:** Tailwind CSS v4 with custom colors (primary color = red-600)
- **State Management:** CartContext (React Context) for shopping cart
- **Animations:** Framer Motion for UI transitions
- **Icons:** Lucide React

### Key Route Structure
```jsx
/ → Store (public storefront)
/admin → AdminLogin
/admin/dashboard → AdminDashboard (PIX config, settings)
```

## 📂 Critical Files by Concern

**State & Data Flow:**
- [src/context/CartContext.jsx](src/context/CartContext.jsx) - Single source of truth for cart state; tracks items with variation+quantity
- [src/lib/supabase.js](src/lib/supabase.js) - Supabase client init (env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Key Components (ordered by data dependency):**
- [src/pages/Store.jsx](src/pages/Store.jsx) - Entry point rendering Hero + Menu
- [src/components/Menu.jsx](src/components/Menu.jsx) - Fetches categories & products from Supabase; filters by category
- [src/components/SizePicker.jsx](src/components/SizePicker.jsx) - Modal for selecting product variation (size/price combo)
- [src/components/CartDrawer.jsx](src/components/CartDrawer.jsx) - Side drawer with cart items; uses CartContext
- [src/components/Checkout.jsx](src/components/Checkout.jsx) - Final order screen with PIX display
- [src/components/PixSettingsModal.jsx](src/components/PixSettingsModal.jsx) - Admin PIX config (4 key types: CPF, CNPJ, Email, Phone)

## 🔄 Data Flow Patterns

### Product Selection & Cart Addition
```
Menu.jsx fetches products → displays by category → 
SizePicker opens (if multi-price) → user selects variation → 
addToCart(product, variation) → CartContext updates → 
FloatingCart badge updates
```

### PIX Payment Flow
```
Checkout.jsx fetches pix_config from store_settings → 
displays key in success screen → 
user copies key → sends proof via WhatsApp
```

### Admin Settings
```
AdminDashboard.jsx opens PixSettingsModal → 
admin inputs PIX details → validations regex-checked → 
saves to store_settings table → persists across sessions
```

## 🎨 Styling Conventions

- **Tailwind-first:** All styling via `className` in JSX
- **Color system:** `bg-primary` = red-600, `bg-secondary` = red-500, `text-primary` = red-600
- **Responsive:** Mobile-first with `md:` breakpoints
- **Animations:** Use Framer Motion `<motion>` components (not CSS animations)
- **Custom utilities:** Defined in tailwind config; no custom CSS files

**Example pattern:**
```jsx
<button className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all shadow-lg">
  Action
</button>
```

## 🧩 Component Patterns

**Modal Pattern:**
- Controlled by parent state (`isOpen` boolean)
- Pass `onClose` callback to dismiss
- Center with `fixed inset-0 flex items-center justify-center`
- Example: [src/components/SizePicker.jsx](src/components/SizePicker.jsx)

**Async Data Fetch:**
- Use `useEffect` with empty dependency to fetch on mount
- Wrap in try-catch with `setLoading` boolean state
- Handle Supabase errors: `.error` on response object
- Example: [src/components/Menu.jsx](src/components/Menu.jsx) lines 19-44

**Form Submission:**
- Validate input with regex (see [src/components/PixSettingsModal.jsx](src/components/PixSettingsModal.jsx) for examples)
- Show loading state during save
- Display toast-like success/error messages
- Clear form on success

## 📊 Database Schema Reference

### Tables & Key Columns:
- **categories:** `id, name, display_order`
- **products:** `id, name, category_id, description, is_active`
- **product_prices:** `id, product_id, size, price`
- **store_settings:** `key, value` (JSON) - stores PIX config under `key="pix_config"`

**PIX Config Structure:**
```json
{
  "pix_key": "123.456.789-01",
  "key_type": "cpf|cnpj|email|phone",
  "holder_name": "PIZZARIA RAMOS",
  "bank_name": "Nubank"
}
```

## 🛠️ Build & Dev Commands

```bash
npm install          # Install deps
npm run dev          # Start Vite dev server (hot reload)
npm run build        # Production build to dist/
npm run preview      # Preview dist/ locally
npm run lint         # ESLint check
```

**Dev server:** `http://localhost:5173` (default Vite port)

## ⚙️ Environment Setup

Create `.env` file in root with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Environment vars are injected at build time via `import.meta.env.VITE_*`

## 🔐 Security & Auth Notes

- **Admin Dashboard:** Protected by AdminLogin component (check username/password against Supabase)
- **Supabase RLS:** Enable row-level security on store_settings table
- **Client-side only:** No backend server; all Supabase calls direct from React
- **Public anon key:** Safe to expose (limited to read + configured RLS policies)

## 📋 Common Tasks

**Add New Menu Item:**
1. Insert into `products` table (set `is_active=true`)
2. Add corresponding `product_prices` rows
3. Menu.jsx fetches automatically on component mount

**Update PIX Settings:**
- Admin clicks "💠 Configurar PIX" in AdminDashboard
- PixSettingsModal opens with form
- Saves to `store_settings` table under `key="pix_config"`
- Checkout.jsx reads same data on success screen

**Create New Admin Feature:**
1. Add button/link in AdminDashboard
2. Create modal component with form
3. Validate inputs with regex
4. Save to appropriate Supabase table
5. Use try-catch + loading state for UX

## 📚 Documentation Files

- [QUICK_START_PIX.md](QUICK_START_PIX.md) - Fast 5-min PIX setup
- [PIX_INTEGRATION_GUIDE.md](PIX_INTEGRATION_GUIDE.md) - Detailed PIX flows
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - SQL + schema reference
- [PIX_DIAGRAMS.md](PIX_DIAGRAMS.md) - Visual flow diagrams
- [ENTREGA_FINAL.md](ENTREGA_FINAL.md) - Complete delivery summary

## ⚡ Performance Tips

- **Images:** Use Hero component patterns (bg-image in JSX, not img tags)
- **List rendering:** Always use `key={id}` on mapped items
- **Modal performance:** Close unused modals to avoid rendering
- **Database queries:** Supabase auto-caches; avoid N+1 by selecting related data
- **Lazy routes:** Consider React Router lazy() for future admin pages

## 🐛 Debugging Guide

**Cart issues:** Check CartContext.jsx - verify addToCart() is called with correct product + variation
**Styling:** Inspect element; verify Tailwind classes load (check build output)
**Supabase:** Open browser DevTools → Network tab → filter "supabase"; check response status
**Environment vars:** Ensure .env exists; restart dev server after changes
**Deployment (Vercel):** Add VITE_* vars in project settings (not .env.local)

## 🏗️ Architecture Decisions

1. **React Context over Redux:** Small app; global state only for cart
2. **Supabase over custom backend:** No backend infrastructure needed; scales automatically
3. **Tailwind v4:** Minimal config required; color system via CSS variables
4. **Framer Motion:** Smooth animations without complex state management
5. **SPA routing:** All data fetches client-side; SEO not critical for admin/checkout

---

**Last Updated:** February 2, 2026  
**Maintainer:** GitHub Copilot  
**Status:** Production-ready with full PIX integration
