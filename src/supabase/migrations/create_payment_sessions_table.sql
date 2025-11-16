-- Create payment_sessions table for Amwal Pay transactions
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_ref TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payment_sessions_transaction_ref ON public.payment_sessions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions(status);

-- Enable RLS
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own payment sessions)
CREATE POLICY "Users can view own payment sessions"
  ON public.payment_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role can manage all payment sessions"
  ON public.payment_sessions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE public.payment_sessions IS 'Payment sessions for Amwal Pay transactions';
COMMENT ON COLUMN public.payment_sessions.transaction_ref IS 'Unique transaction reference from Amwal Pay';
COMMENT ON COLUMN public.payment_sessions.status IS 'Payment status: pending, completed, failed';
