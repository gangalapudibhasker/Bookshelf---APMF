# BOOKSHELF - APMF (Andhra Pradesh Mathematics Forum)

A highly polished, clean, professional, and fully responsive digital mathematics textbook directory website built exclusively for the **Andhra Pradesh Mathematics Forum (APMF)**. 

This is a single-page application designed for students, teachers, and public users to browse and access mathematics textbooks (Classes 6 to 12) hosted securely on OneDrive. It features a password-protected administrator portal for dynamically managing bookshelf entries via URL inputs.

---

## 🎨 UI/UX Design System Features
- **Mathematics Motif:** Subtle, academic-themed SVG coordinate planes, trigonometry graph waves, and geometric accents embedded into layouts.
- **Dynamic Adaptability:** Responsive cards that adjust automatically across different viewports:
  - 📱 **Mobile:** 2 Columns (Fully optimized for vertical touch screens)
  - tabs **Tablet:** 3 Columns
  - 💻 **Desktop:** 4 Columns
- **Micro-animations:** Elegant scale-ups, subtle drop-shadow glows, and active border transitions on card hover.
- **Seamless Accessibility:** Complete Light Mode and Dark Mode support with WCAG-compliant color contrast toggling.
- **Embedded SVG Fallback Branding:** Features a crisp, high-resolution SVG replica of the colorful APMF Hexagon logo built directly into the codebase. If a local `logo.png` is uploaded, it loads automatically; otherwise, it falls back to the beautiful inline vector logo instantly!

---

## ⚙️ Advanced URL Parsing
The site includes a custom JavaScript helper that translates standard sharing links from **Microsoft OneDrive** (including short `1drv.ms` URLs and standard `onedrive.live.com` redir URLs) into direct download stream points. This:
1. Avoids heavy Microsoft landing portals and sign-in gates.
2. Allows immediate, fast, and seamless loading of resources for users.
3. Streamlines the "Open Book" click behavior.

---

## 🔐 Administrator Access
The administration panel is secured with standard passcode authentication (no heavy backend databases needed, keeping the site 100% serverless and lightweight).

- **Direct Route:** Navigate by appending `#admin` to the URL or click the discreet **"Admin Login"** link in the footer.
- **Default Security Passcode:** `APMF2026`
- **Dashboard Features:**
  - **Live Preview Panel:** Instantly checks and previews cover images, titles, and class tags in real-time as the admin inputs the URL before saving.
  - **Administrative CRUD Table:** View all loaded records, search or filter them, edit existing textbooks, and delete obsolete entries.
  - **Automatic Persistence:** Syncs instantly with `localStorage` in the browser, making sure your database additions persist across page reloads.

---

## 🚀 Deployment Instructions
This project has zero build dependencies or Node.js runtime needs, making it compatible with any static website hosting provider:

### 1. GitHub Pages (Highly Recommended - 100% Free)
1. Initialize a Git repository in the folder.
2. Push your code to a public/private repository on GitHub.
3. Go to **Settings > Pages** in your repository.
4. Set the build source to **Deploy from a branch**, select `main` (or your active branch) and root `/`, and click **Save**.

### 2. Vercel / Netlify
1. Log in to Vercel or Netlify.
2. Click **Add New Project** and connect your repository.
3. Leave the build settings blank (the directory is ready for static deployment).
4. Click **Deploy**.

---

## 📁 File Structure
- `index.html` — Core HTML5 frame, search system, and modal structures.
- `styles.css` — Responsive design tokens, styling rules, light/dark themes, and math SVG grids.
- `app.js` — Core JavaScript logic (pre-populated textbooks, tab filters, OneDrive formatters, and admin CRUD logic).
- `logo.png` — (Optional) Place your small custom logo here to override the SVG fallback.
