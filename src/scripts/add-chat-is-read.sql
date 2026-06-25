-- Script to add 'is_read' column to messages table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
