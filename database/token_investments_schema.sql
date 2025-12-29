-- Dimen Token Investments Schema

CREATE TABLE IF NOT EXISTS token_investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount_inr DECIMAL(12, 2) NOT NULL,
    token_amount DECIMAL(18, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE token_investments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own investments" ON token_investments;
CREATE POLICY "Users can view their own investments" ON token_investments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own investments" ON token_investments;
CREATE POLICY "Users can create their own investments" ON token_investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all investments" ON token_investments;
CREATE POLICY "Admins can view all investments" ON token_investments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_token_investments_user ON token_investments(user_id);
