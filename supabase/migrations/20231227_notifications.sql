-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Recipient
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Person who triggered the notification
    type TEXT CHECK (type IN ('comment', 'like', 'follow')),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System/Users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true); -- Usually triggered by functions, but allowing insert for now if we do it from frontend

-- Index for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);
