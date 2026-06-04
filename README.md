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
  - **Automatic Persistence:** Saves book metadata to Supabase so deployed Netlify/GitHub Pages instances and other devices show the same bookshelf records. `localStorage` is used only as a temporary offline cache.

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

---

## 🔄 Supabase Sync Troubleshooting

Uploaded cover images can exist in Supabase Storage even when the app still shows old data. Storage only keeps the file; the bookshelf UI also needs a metadata record with the book title, class, medium, cover URL, and OneDrive URL.

### Required setup
1. Open **Supabase Dashboard > SQL Editor**.
2. Open the repository file `supabase/books_schema.sql`, copy **all of the SQL text inside that file**, paste it into the Supabase SQL Editor, and click **Run**.
   - Do **not** type or paste only `supabase/books_schema.sql` into the SQL Editor. That is just the file path, not a SQL command, and Supabase will return an error such as `syntax error at or near "supabase"`.
3. Confirm that:
   - the `public.books` table exists with the expected columns (`title`, `author`, `cover_image`, `file_attachment`, `genre`, `year`, `description`, `theme`, etc.),
   - the `book-shelf` storage bucket exists and is public,
   - Row Level Security policies allow the static app to read and write the table/storage bucket,
   - Realtime is enabled for `public.books`.

### What the app now does
- Loads book records from `public.books` and also lists files in the `book-shelf` Supabase Storage bucket, so existing uploaded Storage files can appear even before they have table metadata. `localStorage` is only a temporary/offline cache if Supabase cannot be reached.
- Attempts to save every add/edit/delete metadata operation to the Supabase `books` table; if metadata writes are blocked by RLS, the uploaded file still appears locally and can also appear via Storage listing once Storage read/list policies are configured.
- Subscribes to Supabase Realtime changes and refreshes open app windows automatically.
- Uploads cover files with unique filenames and appends a version query string to avoid stale browser/CDN cache when replacing a cover.


### Important Netlify deployment note
The deployed app no longer renders hardcoded textbook records and filters the old demo records if they were cached or accidentally seeded. If Netlify shows an empty bookshelf, that means the browser could not read rows from `public.books` or list files from `book-shelf`. Verify each Supabase row has at least `id` and `title`, verify the table select policy allows anonymous reads, and verify `storage.objects` has a public read/list policy for `bucket_id = 'book-shelf'`. The app maps your schema as `cover_image` for covers, `file_attachment` for book files, `author` as the displayed medium/source, and `theme` for class text such as `Class 10`.

### Common causes when uploads do not appear in the UI
- **Only Storage changed:** A file upload succeeded, but no row was inserted/updated in `public.books`. The app now lists `book-shelf` as a backup source, but table metadata is still best for accurate titles/classes/file links.
- **RLS blocked metadata writes:** Storage policies may allow uploads while table policies reject `insert`, `update`, or `delete` calls. If this happens, rerun `supabase/books_schema.sql`; the app no longer stops the UI update just because metadata sync was blocked.
- **Private bucket or missing object read policy:** The app receives a URL, but the browser cannot load the image publicly.
- **Stale cached URL:** Re-uploading to the same object path can keep the old image visible because the public URL did not change.
- **LocalStorage-only state:** The previous implementation saved the book list per browser, so a GitHub Pages deployment or another device could not see the new records.
- **Realtime disabled:** Existing open browser tabs will not auto-refresh until reload unless the table is added to the Supabase realtime publication.

### Best practices
- Treat `public.books` as the source of truth and `localStorage` only as cache; do not seed or render hardcoded/demo records in production.
- Keep Storage object paths unique for replacement uploads.
- Watch the browser DevTools console and Network tab for Supabase errors, especially `401`, `403`, missing table/column errors, `NOT NULL` constraint failures, and RLS policy failures.
- For production security, replace broad anon write policies with Supabase Auth or an Edge Function that verifies administrator access server-side.
