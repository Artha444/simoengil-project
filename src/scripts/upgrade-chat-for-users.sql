-- Upgrade messages table for user-based live chat
-- Run this SQL in your Supabase SQL Editor

-- Drop foreign key constraint on product_id (it prevents using it as session/user identifier)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_product_id_fkey;

-- Allow product_id to be NULL
ALTER TABLE public.messages ALTER COLUMN product_id DROP NOT NULL;

-- Add user_id and user_name columns for user identification
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create index for faster conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_role ON public.messages(sender_role);
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON public.messages(product_id);
