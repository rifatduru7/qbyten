QbYTen Web (Vite + Cloudflare Pages)

Overview

- This repo packages the existing `index.html` as a modern Vite app so it can be built and deployed on Cloudflare Pages.
- All visuals, animations and interactions from `index.html` remain unchanged initially. Next steps will modularize JS/CSS and add an Admin panel with Cloudflare D1.

Local Development

- Prerequisites: Node.js 18+
- Install deps: `npm install`
- Run dev server: `npm run dev` (Vite serves `index.html` as-is)
- Cloudflare Pages dev with Functions/D1: `npm run dev:cf`
  - Seed local D1: `npm run db:local:setup`

Build

- `npm run build` → outputs to `dist/`
- `npm run preview` → serves the production build locally

Cloudflare Pages

- Project type: "Framework preset: None / Vite"
- Build command: `npm run build`
- Output directory: `dist`
- Functions: `functions/` auto-discovered by Pages
- D1 binding: add binding name `DB` in Pages → Settings → Functions → D1 Bindings
- Admin token: add env var `ADMIN_TOKEN` (same panel) to protect write API calls

Admin Panel

- URL: `/admin/` (served from `public/admin/index.html`)
- Set `ADMIN_TOKEN` in browser: `localStorage.setItem('ADMIN_TOKEN', 'your-token')`
- Features: view/save settings, add/list products and services

Planned Next Steps

- Extract inline `<style>` and `<script>` into `/src` modules for maintainability.
- Add `/functions` (Cloudflare Pages Functions) with APIs for Admin panel.
- Expand admin (edit/delete items, auth UI, audit logs)
- Optionally move remaining inline styles to CSS variables and theme structure
- Wire Cloudflare KV/R2 if needed for assets
