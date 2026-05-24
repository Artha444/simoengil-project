-- Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipping_address JSONB NOT NULL,
  courier JSONB NOT NULL,
  items JSONB NOT NULL,
  total_price BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  midtrans_transaction_id TEXT,
  midtrans_token TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own orders
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
