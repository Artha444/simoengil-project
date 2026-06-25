-- Script to create site_settings table for Boneka Simoengil
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.site_settings (
  id text primary key,
  settings jsonb not null default '{}'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings (for homepage)
CREATE POLICY "Allow public read access on site_settings"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated admin users to insert or update settings
CREATE POLICY "Allow authenticated admins to insert site_settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Allow authenticated admins to update site_settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Insert initial dummy data to avoid 404
INSERT INTO public.site_settings (id, settings) 
VALUES ('homepage', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
