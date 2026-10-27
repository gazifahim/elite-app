# ELITE – React (Vite)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What's new
- **EN / বাং switch** (navbar) – English by default. All text lives in `src/i18n/translations.js`; add a key there and use `t("path.to.key")`.
- **Customize order** – `src/components/CustomOrder.jsx` (image, text, estimated time + submit). The `sendToAdmin()` function is a UI-only stub that logs the data; replace it with a real `fetch()` when you have a backend.
- **Welcome snackbar** – `src/components/WelcomeSnackbar.jsx`, shown once per browser session (clear sessionStorage / open a new tab to see it again).
