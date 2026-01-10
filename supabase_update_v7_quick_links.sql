-- Function to check if the current user is an admin
-- It checks either the authenticated user ID OR the provided x-login-code header
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  header_code TEXT;
BEGIN
  -- 1. Check Standard Auth (if user is logged in via Email/Password)
  IF auth.uid() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
      AND is_admin = true
    );
  END IF;

  -- 2. Check Login Code Header (if user is logged in via Code)
  BEGIN
    header_code := current_setting('request.headers', true)::json->>'x-login-code';
  EXCEPTION WHEN OTHERS THEN
    header_code := NULL;
  END;

  IF header_code IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE login_code = header_code
      AND is_admin = true
    );
  END IF;

  RETURN FALSE;
END;
$$;

-- Grant execute permission on the function to everyone (including anon for code login)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Create quick_links table
CREATE TABLE IF NOT EXISTS quick_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_url TEXT,
  category TEXT NOT NULL, -- 'General', 'Development', 'Design', 'Resources', 'Social', 'Tools'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Grant table permissions to authenticated AND anon (for code login)
GRANT ALL ON TABLE quick_links TO authenticated;
GRANT ALL ON TABLE quick_links TO anon;
GRANT ALL ON TABLE quick_links TO service_role;

-- Enable Row Level Security
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view quick links
DROP POLICY IF EXISTS "Everyone can view quick links" ON quick_links;
CREATE POLICY "Everyone can view quick links" ON quick_links
  FOR SELECT USING (true);

-- Only admins can insert quick links
DROP POLICY IF EXISTS "Admins can insert quick links" ON quick_links;
CREATE POLICY "Admins can insert quick links" ON quick_links
  FOR INSERT WITH CHECK ( public.is_admin() );

-- Only admins can update quick links
DROP POLICY IF EXISTS "Admins can update quick links" ON quick_links;
CREATE POLICY "Admins can update quick links" ON quick_links
  FOR UPDATE USING ( public.is_admin() );

-- Only admins can delete quick links
DROP POLICY IF EXISTS "Admins can delete quick links" ON quick_links;
CREATE POLICY "Admins can delete quick links" ON quick_links
  FOR DELETE USING ( public.is_admin() );

-- Create storage bucket for quick link icons if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('quick-link-icons', 'quick-link-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Grant storage permissions to anon as well
GRANT ALL ON TABLE storage.objects TO anon;

-- Storage policies for quick-link-icons
DROP POLICY IF EXISTS "Everyone can view quick link icons" ON storage.objects;
CREATE POLICY "Everyone can view quick link icons" ON storage.objects
  FOR SELECT USING (bucket_id = 'quick-link-icons');

DROP POLICY IF EXISTS "Admins can upload quick link icons" ON storage.objects;
CREATE POLICY "Admins can upload quick link icons" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'quick-link-icons' AND
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update quick link icons" ON storage.objects;
CREATE POLICY "Admins can update quick link icons" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'quick-link-icons' AND
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete quick link icons" ON storage.objects;
CREATE POLICY "Admins can delete quick link icons" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'quick-link-icons' AND
    public.is_admin()
  );