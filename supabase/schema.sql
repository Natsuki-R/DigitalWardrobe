-- Clothing items table
CREATE TABLE clothes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  brand TEXT,
  color TEXT,
  image_url TEXT,
  notes TEXT,
  archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Daily outfit entries
CREATE TABLE outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  notes TEXT,
  starred BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Junction table: which clothes are in which outfit
CREATE TABLE outfit_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE NOT NULL,
  clothes_id UUID REFERENCES clothes(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(outfit_id, clothes_id)
);

-- Indexes
CREATE INDEX idx_outfit_items_clothes_id ON outfit_items(clothes_id);
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);
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

-- Disable RLS restrictions (single user, no auth)
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on clothes" ON clothes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on outfits" ON outfits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on outfit_items" ON outfit_items FOR ALL USING (true) WITH CHECK (true);
