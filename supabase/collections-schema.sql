-- Collections table (albums, CDs, devices, books, etc.)
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  brand TEXT,
  image_url TEXT,
  notes TEXT,
  archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for filtering
CREATE INDEX idx_collections_category ON collections(category);

-- Auto-update updated_at
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS policies (match existing pattern: public read, auth write)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read collections" ON collections
  FOR SELECT USING (true);
CREATE POLICY "Auth insert collections" ON collections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update collections" ON collections
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete collections" ON collections
  FOR DELETE USING (auth.role() = 'authenticated');

-- Storage policies for collection-images bucket
-- (Create the bucket manually in Supabase Dashboard > Storage, name: collection-images, public)
CREATE POLICY "Public read collection images" ON storage.objects
  FOR SELECT USING (bucket_id = 'collection-images');
CREATE POLICY "Auth upload collection images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'collection-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete collection images" ON storage.objects
  FOR DELETE USING (bucket_id = 'collection-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update collection images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'collection-images' AND auth.role() = 'authenticated');
