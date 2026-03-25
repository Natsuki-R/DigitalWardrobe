# Wardrobe App - Build Plan

## Project Context
- **Repo:** https://github.com/Nsnap1162-R/DigitalWardrobe.git
- **Single user, no auth** — personal use only
- **Goal:** Runnable MVP with 3 core features deployed on Vercel
- **Requirements:** See `Requirement.md` for full spec
- **Env vars:** Already configured in `.env.local`

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **UI:** shadcn/ui + Tailwind CSS v4
- **Backend/DB:** Supabase (PostgreSQL + Storage)
- **Deployment:** Vercel
- **No auth** — single user, no login required

---

## Phase 1: Project Scaffold

### Step 1.1 — Initialize Next.js
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```
- If prompted about overwriting existing files, proceed (only .env.local and docs exist)
- Move `.env.local` back if overwritten

### Step 1.2 — Install Dependencies
```bash
npm install @supabase/supabase-js
npm install lucide-react date-fns
npx shadcn@latest init
```
- When `shadcn init` prompts: choose "New York" style, "Neutral" base color, CSS variables = yes

### Step 1.3 — Install shadcn Components
```bash
npx shadcn@latest add button card input label select dialog sheet calendar popover badge tabs scroll-area separator dropdown-menu toast
```

### Step 1.4 — Verify Setup
```bash
npm run dev
```
- Confirm app runs at http://localhost:3000 with no errors
- **If stuck:** Check Node version (need 18+). Check that `.env.local` exists with valid values.

### Step 1.5 — Configure .gitignore
Ensure these are in `.gitignore`:
```
.env.local
.env*.local
node_modules/
```

**Phase 1 complete when:** App runs locally with shadcn working. Commit: `"chore: scaffold Next.js project with shadcn/ui"`

---

## Phase 2: Supabase Setup

### Step 2.1 — Create Supabase Client Utility
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 2.2 — Create Database Types
Create `src/lib/types.ts` with TypeScript types matching the DB schema (see Phase 2.3).

### Step 2.3 — Database Schema SQL
Generate this SQL file at `supabase/schema.sql` for the human to run in Supabase SQL Editor:

```sql
-- Categories enum for clothing
CREATE TYPE clothing_category AS ENUM (
  'tops', 'bottoms', 'outerwear', 'dresses', 'shoes', 'bags', 'accessories', 'other'
);

-- Clothing items table
CREATE TABLE clothes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category clothing_category NOT NULL DEFAULT 'other',
  brand TEXT,
  color TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Daily outfit entries
CREATE TABLE outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Junction table: which clothes are in which outfit
CREATE TABLE outfit_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE NOT NULL,
  clothes_id UUID REFERENCES clothes(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(outfit_id, clothes_id)
);

-- Index for fast wear-count queries
CREATE INDEX idx_outfit_items_clothes_id ON outfit_items(clothes_id);
CREATE INDEX idx_outfits_date ON outfits(date);

-- Auto-update updated_at on clothes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clothes_updated_at
  BEFORE UPDATE ON clothes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Disable RLS (single user, no auth)
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on clothes" ON clothes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on outfits" ON outfits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on outfit_items" ON outfit_items FOR ALL USING (true) WITH CHECK (true);
```

### Step 2.4 — Verify Supabase Connection
Create a simple test: fetch from `clothes` table (should return empty array, not an error).
- **If stuck:** Check `.env.local` values. Check that the SQL has been run. Check Supabase project is not paused.

**Phase 2 complete when:** `supabase.from('clothes').select('*')` returns `{ data: [], error: null }`.

**HUMAN ACTION REQUIRED:** Run the SQL in `supabase/schema.sql` in the Supabase Dashboard → SQL Editor. Agent cannot do this.

---

## Phase 3: Layout & Navigation

### Step 3.1 — App Layout
Create a clean layout with sidebar/bottom navigation:
- **Desktop:** Sidebar with 3 nav items
- **Mobile:** Bottom tab bar
- Nav items: Closet (shirt icon), Outfits (calendar icon), Stats (bar-chart icon)
- App name/logo at top of sidebar

### Step 3.2 — Page Routes
```
src/app/
├── layout.tsx          (root layout with nav)
├── page.tsx            (redirect to /closet)
├── closet/
│   └── page.tsx        (browse all clothes)
├── outfits/
│   └── page.tsx        (daily outfit log)
└── stats/
    └── page.tsx        (usage tracking dashboard)
```

### Step 3.3 — Design Tokens
- Keep shadcn defaults but ensure a clean, fashion-forward feel
- Neutral color palette, good whitespace, elegant typography
- All pages responsive (mobile-first)

**Phase 3 complete when:** All 3 pages render with working navigation. Commit: `"feat: app layout and navigation"`

---

## Phase 4: Clothes Closet (Core Feature 1)

### Step 4.1 — Clothes List View
- Grid of clothing cards (image + name + category + wear count badge)
- Filter by category (tabs or dropdown)
- Search by name/brand
- Empty state with CTA to add first item

### Step 4.2 — Add Clothing Item
- Dialog/sheet form with fields: name (required), category (required), brand, color, image upload, notes
- Image upload flow:
  1. User selects image file
  2. Upload to Supabase Storage bucket `clothes-images`
  3. Get public URL back
  4. Save URL in `clothes.image_url`
- On success: close dialog, refresh list, show toast

### Step 4.3 — Edit Clothing Item
- Same form as add, pre-filled with existing data
- Allow replacing image
- Save updates to Supabase

### Step 4.4 — Delete Clothing Item
- Confirmation dialog before delete
- Delete image from storage too
- Cascade deletes outfit_items references (handled by DB)

### Step 4.5 — Image Upload Helper
Create `src/lib/storage.ts`:
- `uploadClothesImage(file: File): Promise<string>` — uploads to Supabase Storage, returns public URL
- `deleteClothesImage(url: string): Promise<void>` — removes from storage
- Handle file naming (use UUID to avoid collisions)
- Compress/resize on client if image > 1MB (optional but nice)

**Troubleshooting:**
- If image upload fails with 403: check that `clothes-images` bucket exists and is set to public in Supabase Dashboard
- If upload fails with size error: check Supabase free tier limits (50MB storage bucket default)
- If images don't display: check that the public URL format is correct

**Phase 4 complete when:** Can add, view, edit, and delete clothes with images. Commit: `"feat: clothes closet CRUD with image upload"`

---

## Phase 5: Daily Outfit Log (Core Feature 2)

### Step 5.1 — Calendar View
- Month calendar showing which days have logged outfits (dot indicator)
- Click a date to view/edit that day's outfit
- Today highlighted
- Use shadcn Calendar component or build a simple one

### Step 5.2 — Outfit Entry for a Date
- When a date is selected, show a panel/dialog:
  - If outfit exists: show the items worn that day, allow editing
  - If no outfit: show "Log today's outfit" prompt
- Item picker: searchable grid of all clothes, click to toggle selection
- Show selected items as a visual outfit summary
- Optional notes field
- Save: upsert outfit record + outfit_items junction records

### Step 5.3 — Outfit Display
- Show outfit as a mini gallery of the selected clothing item images
- Display date and notes

**Troubleshooting:**
- If date filtering is off: ensure dates are stored/compared in correct timezone (use UTC in DB, convert on display)
- If items don't save: check that outfit_id is correctly passed to outfit_items inserts

**Phase 5 complete when:** Can select a date, pick clothes, save outfit, and see it on the calendar. Commit: `"feat: daily outfit logging with calendar"`

---

## Phase 6: Usage Stats (Core Feature 3)

### Step 6.1 — Wear Count Query
```sql
SELECT c.*, COUNT(oi.id) as wear_count
FROM clothes c
LEFT JOIN outfit_items oi ON c.id = oi.clothes_id
GROUP BY c.id
ORDER BY wear_count DESC
```

### Step 6.2 — Stats Dashboard Page
- **Top worn items** — ranked list with images and wear count
- **Never worn** — items with 0 wear count (nudge to wear them!)
- **Category breakdown** — how many items per category
- **Total stats** — total items, total outfits logged, average items per outfit
- **Recent activity** — last 7 days of outfits

### Step 6.3 — Per-Item Wear Count
- Show wear count badge on each clothing card in the closet view (Phase 4 integration)
- Closet page can sort by: most worn, least worn, newest, oldest

**Phase 6 complete when:** Stats page shows accurate data, wear counts appear on closet cards. Commit: `"feat: usage tracking and stats dashboard"`

---

## Phase 7: Polish & Deploy

### Step 7.1 — UI Polish
- Loading states (skeleton loaders for images/lists)
- Empty states (friendly messages when no data)
- Toast notifications for actions (added, deleted, saved)
- Smooth transitions
- Mobile responsiveness check on all pages
- Favicon and page titles

### Step 7.2 — Error Handling
- Wrap Supabase calls with try/catch
- Show user-friendly error toasts, not raw errors
- Handle image upload failures gracefully (allow saving item without image)

### Step 7.3 — Performance
- Use `next/image` for optimized image loading
- Lazy load images in grid views
- Debounce search input

### Step 7.4 — Git & Deploy
```bash
git add -A
git commit -m "feat: complete MVP wardrobe app"
git remote add origin https://github.com/Natsuki-R/DigitalWardrobe.git
git branch -M main
git push -u origin main
```
- Vercel will auto-deploy from GitHub
- **HUMAN ACTION REQUIRED:** Add env vars in Vercel Dashboard → Project Settings → Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Phase 7 complete when:** App is deployed and accessible via Vercel URL.

---

## File Structure (Expected Final State)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── closet/
│   │   └── page.tsx
│   ├── outfits/
│   │   └── page.tsx
│   └── stats/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── mobile-nav.tsx
│   ├── clothes/
│   │   ├── clothes-grid.tsx
│   │   ├── clothes-card.tsx
│   │   ├── clothes-form.tsx
│   │   └── image-upload.tsx
│   ├── outfits/
│   │   ├── outfit-calendar.tsx
│   │   ├── outfit-editor.tsx
│   │   └── item-picker.tsx
│   ├── stats/
│   │   ├── top-worn.tsx
│   │   ├── category-breakdown.tsx
│   │   └── stats-summary.tsx
│   └── ui/               (shadcn components - auto-generated)
├── lib/
│   ├── supabase.ts
│   ├── storage.ts
│   └── types.ts
└── hooks/
    ├── use-clothes.ts
    ├── use-outfits.ts
    └── use-stats.ts
```

---

## Human Action Summary (all manual steps in one place)

| When | What to do |
|------|-----------|
| After Phase 2.3 | Run `supabase/schema.sql` in Supabase Dashboard → SQL Editor |
| After Phase 4 (if upload fails) | Check `clothes-images` bucket is public in Supabase Dashboard → Storage |
| After Phase 7.4 | Add env vars to Vercel Dashboard |
| After deploy | Test the live app and report any issues |

---

## Agent Self-Recovery Rules

1. **Build error?** Read the error message carefully. Check imports, missing packages, typos. Fix and retry.
2. **Supabase error?** Verify `.env.local` values. Test connection with a simple select query. Check if schema was applied.
3. **Image upload error?** Check bucket name matches `clothes-images`. Check bucket is public. Check file size.
4. **Type error?** Ensure `types.ts` matches the actual DB schema. Regenerate if needed.
5. **UI broken?** Run `npm run dev`, check browser console for errors. Check component imports.
6. **Stuck in a loop?** After 3 failed attempts at the same fix, log the issue clearly and move to the next phase. Return to fix later.
7. **Need human?** Only ask when: need to run SQL in Supabase Dashboard, need to configure Vercel, or encountering an issue that requires account access.
