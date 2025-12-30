-- Token Activity Table
CREATE TABLE IF NOT EXISTS token_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'purchase', 'lock_initiated', 'lock_bonus', 'redemption', 'referral'
    amount DECIMAL NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE token_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" 
ON token_activity FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure token_locks has necessary fields if not already present
-- (Assuming token_locks was created previously, adding progress tracking)
-- ALTER TABLE token_locks ADD COLUMN IF NOT EXISTS bonus_claimed BOOLEAN DEFAULT FALSE;

-- Function to help calculate balance components
CREATE OR REPLACE FUNCTION get_user_token_stats(u_id UUID)
RETURNS JSONB AS $$
DECLARE
    total_purchased DECIMAL;
    total_locked DECIMAL;
    total_bonus DECIMAL;
    total_spent DECIMAL;
    result JSONB;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_purchased FROM token_activity WHERE user_id = u_id AND type = 'purchase' AND status = 'completed';
    SELECT COALESCE(SUM(amount), 0) INTO total_locked FROM token_locks WHERE user_id = u_id AND status = 'active';
    SELECT COALESCE(SUM(bonus_amount), 0) INTO total_bonus FROM token_locks WHERE user_id = u_id AND status = 'active';
    SELECT COALESCE(SUM(amount), 0) INTO total_spent FROM token_activity WHERE user_id = u_id AND type = 'redemption' AND status = 'completed';

    result = jsonb_build_object(
        'available', total_purchased - total_locked - total_spent,
        'locked', total_locked,
        'bonus_pending', total_bonus,
        'total_balance', (total_purchased - total_spent) + total_bonus
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
