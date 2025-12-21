-- Add bio to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (follower_id, following_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('text', 'image', 'poll', 'painting')),
    content TEXT,
    media_url TEXT,
    painting_id UUID REFERENCES public.paintings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0
);

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, option_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Follows policies
CREATE POLICY "Public follows are viewable by everyone" ON public.follows
    FOR SELECT USING (true);
    
CREATE POLICY "Users can follow others" ON public.follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);
    
CREATE POLICY "Users can unfollow" ON public.follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Posts policies
CREATE POLICY "Public posts are viewable by everyone" ON public.posts
    FOR SELECT USING (true);
    
CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- Polls & Options policies (Viewable by everyone, creators/system can insert)
CREATE POLICY "Polls are viewable by everyone" ON public.polls 
    FOR SELECT USING (true);
    
CREATE POLICY "Users can create polls via post" ON public.polls 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE id = post_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Poll options are viewable by everyone" ON public.poll_options 
    FOR SELECT USING (true);
    
CREATE POLICY "Users can create poll options via poll" ON public.poll_options 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls p 
            JOIN public.posts po ON p.post_id = po.id 
            WHERE p.id = poll_id AND po.user_id = auth.uid()
        )
    );

-- Poll votes policies
CREATE POLICY "Votes are viewable by everyone" ON public.poll_votes 
    FOR SELECT USING (true);
    
CREATE POLICY "Users can vote" ON public.poll_votes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
