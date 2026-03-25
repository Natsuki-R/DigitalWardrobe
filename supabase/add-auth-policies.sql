-- Run this in Supabase SQL Editor to switch from open access to auth-based access
-- Read: anyone | Write: authenticated users only

-- Drop old open policies
DROP POLICY IF EXISTS "Allow all on clothes" ON clothes;
DROP POLICY IF EXISTS "Allow all on outfits" ON outfits;
DROP POLICY IF EXISTS "Allow all on outfit_items" ON outfit_items;

-- Clothes: public read, auth write
CREATE POLICY "Public read clothes" ON clothes
  FOR SELECT USING (true);
CREATE POLICY "Auth insert clothes" ON clothes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update clothes" ON clothes
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete clothes" ON clothes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Outfits: public read, auth write
CREATE POLICY "Public read outfits" ON outfits
  FOR SELECT USING (true);
CREATE POLICY "Auth insert outfits" ON outfits
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update outfits" ON outfits
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete outfits" ON outfits
  FOR DELETE USING (auth.role() = 'authenticated');

-- Outfit items: public read, auth write
CREATE POLICY "Public read outfit_items" ON outfit_items
  FOR SELECT USING (true);
CREATE POLICY "Auth insert outfit_items" ON outfit_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update outfit_items" ON outfit_items
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete outfit_items" ON outfit_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- Storage: public read, auth upload/delete
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;

CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'clothes-images');
CREATE POLICY "Auth upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'clothes-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'clothes-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'clothes-images' AND auth.role() = 'authenticated');
