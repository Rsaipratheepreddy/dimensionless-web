-- Leasable Artwork Table
CREATE TABLE IF NOT EXISTS public.leasable_paintings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    artist_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    hourly_rate DECIMAL(12,2) DEFAULT 0.00,
    daily_rate DECIMAL(12,2) DEFAULT 0.00,
    monthly_rate DECIMAL(12,2) DEFAULT 0.00,
    yearly_rate DECIMAL(12,2) DEFAULT 0.00,
    preferred_rate_interval TEXT DEFAULT 'monthly' CHECK (preferred_rate_interval IN ('hourly', 'daily', 'monthly', 'yearly')),
    artist_avatar_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Leasing Orders Table
CREATE TABLE IF NOT EXISTS public.lease_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    painting_id UUID REFERENCES public.leasable_paintings(id) ON DELETE CASCADE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add new columns if they don't exist (in case table was created previously)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leasable_paintings' AND column_name='preferred_rate_interval') THEN
        ALTER TABLE public.leasable_paintings ADD COLUMN preferred_rate_interval TEXT DEFAULT 'monthly' CHECK (preferred_rate_interval IN ('hourly', 'daily', 'monthly', 'yearly'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leasable_paintings' AND column_name='artist_avatar_url') THEN
        ALTER TABLE public.leasable_paintings ADD COLUMN artist_avatar_url TEXT;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.leasable_paintings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lease_orders ENABLE ROW LEVEL SECURITY;

-- Policies for leasable_paintings
DROP POLICY IF EXISTS "Everyone can view leasable paintings" ON public.leasable_paintings;
CREATE POLICY "Everyone can view leasable paintings" ON public.leasable_paintings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage leasable paintings" ON public.leasable_paintings;
CREATE POLICY "Admins can manage leasable paintings" ON public.leasable_paintings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for lease_orders
DROP POLICY IF EXISTS "Users can view their own lease orders" ON public.lease_orders;
CREATE POLICY "Users can view their own lease orders" ON public.lease_orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create lease orders" ON public.lease_orders;
CREATE POLICY "Users can create lease orders" ON public.lease_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view and manage all lease orders" ON public.lease_orders;
CREATE POLICY "Admins can view and manage all lease orders" ON public.lease_orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
