# Digital Wardrobe App - MVP Requirements

## Overview
A personal wardrobe tracking app for a single user to catalog clothing, log daily outfits, and track wear frequency. MVP focused on core functionality with a simple but elegant UI.

## Tech Stack
- **Framework:** Next.js (or Nuxt.js - TBD)
- **Backend/DB:** Supabase (auth, database, storage)
- **Deployment:** Vercel
- **Data:** Supabase PostgreSQL (not JSON files)
- **Image Storage:** Supabase Storage (max ~1,000 images)

## Core Features

### 1. Clothes Closet (Store All Your Clothes)
- Add clothing items with photo upload
- Categorize items (e.g., tops, bottoms, outerwear, shoes, accessories)
- Store metadata per item: name, brand, color, category, date added
- Browse/filter/search the closet
- Edit or remove items

### 2. Daily Outfit Log
- Select clothes from closet to log what you wore each day
- One outfit entry per day (calendar-based)
- View past outfits by date
- Optional: notes or occasion tags

### 3. Usage Tracking
- Automatically count how many times each item has been worn
- Display wear count on each clothing item
- Sort/filter by most worn, least worn, never worn
- Basic stats/insights (e.g., most worn this month)

## Design Principles
- Simple but elegant UI
- Clean, minimal aesthetic
- Mobile-friendly (responsive)
- Fast and usable - prioritize practicality over polish

## Scope & Constraints
- Single user only (personal use)
- No social features, no sharing
- Max ~1,000 clothing items/images
- MVP only - no advanced features (AI styling suggestions, weather integration, etc.)
