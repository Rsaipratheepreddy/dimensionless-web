import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Fetch Token Config from home_config
        const { data: config, error: configError } = await supabase
            .from('home_config')
            .select('*')
            .eq('id', 'token_launch_config')
            .single();

        // 2. Fetch User-specific Stats if logged in
        let userStats: any = {
            total_stake: 0,
            available: 0,
            locked: 0,
            bonus_pending: 0,
            lifetime: 0,
            tier: 'Explorer',
            next_tier: 'Patron',
            points_to_next: 10000,
            tier_progress: 0
        };

        const { data: { user } } = await supabase.auth.getUser();
        let recentActivity = [];
        let activeLocks = [];

        let chartData = {
            labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                { label: 'Available', data: [0, 0, 0, 0, 0, 0] },
                { label: 'Locked', data: [0, 0, 0, 0, 0, 0] }
            ]
        };

        if (user) {
            // Fetch all activities for chart calculation
            const { data: allActivity } = await supabase
                .from('token_activity')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (allActivity && allActivity.length > 0) {
                let runningAvailable = 0;
                let runningLocked = 0;

                allActivity.forEach(act => {
                    if (act.type === 'purchase') runningAvailable += Number(act.amount);
                    if (act.type === 'lock_initiated') {
                        runningAvailable -= Number(act.amount);
                        runningLocked += Number(act.amount);
                    }

                    const monthIdx = new Date(act.created_at).getMonth() - 6;
                    if (monthIdx >= 0 && monthIdx < 6) {
                        chartData.datasets[0].data[monthIdx] = runningAvailable;
                        chartData.datasets[1].data[monthIdx] = runningLocked;
                    } else {
                        chartData.datasets[0].data[5] = runningAvailable;
                        chartData.datasets[1].data[5] = runningLocked;
                    }
                });

                for (let i = 1; i < 6; i++) {
                    if (chartData.datasets[0].data[i] === 0) chartData.datasets[0].data[i] = chartData.datasets[0].data[i - 1];
                    if (chartData.datasets[1].data[i] === 0) chartData.datasets[1].data[i] = chartData.datasets[1].data[i - 1];
                    if (chartData.datasets[2].data[i] === 0) chartData.datasets[2].data[i] = chartData.datasets[2].data[i - 1];
                }
            }

            // Fetch investments
            const { data: investments } = await supabase
                .from('token_investments')
                .select('token_amount, status')
                .eq('user_id', user.id);

            // Fetch locks
            const { data: locks } = await supabase
                .from('token_locks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            activeLocks = (locks || []).filter(l => l.status === 'active');

            // Fetch recent activity
            const { data: activity } = await supabase
                .from('token_activity')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            recentActivity = activity || [];

            const totalInv = (investments || [])
                .filter(i => i.status === 'completed')
                .reduce((sum, i) => sum + Number(i.token_amount), 0);

            const totalLockPrincipal = (locks || [])
                .filter(l => l.status === 'active')
                .reduce((sum, l) => sum + Number(l.amount), 0);

            userStats = {
                total_purchased: totalInv,
                available: totalInv - totalLockPrincipal,
                locked: totalLockPrincipal,
                lifetime: totalInv,
                tier: totalInv > 50000 ? 'Legacy' : totalInv > 10000 ? 'Patron' : 'Collector',
                next_tier: totalInv > 50000 ? null : totalInv > 10000 ? 'Legacy' : 'Patron',
                points_to_next: totalInv > 50000 ? 0 : totalInv > 10000 ? 50000 - totalInv : 10000 - totalInv,
                tier_progress: totalInv > 50000 ? 100 : totalInv > 10000 ? ((totalInv - 10000) / 40000) * 100 : (totalInv / 10000) * 100
            };
        }

        // 3. Fetch Blue Chip Art
        const { data: blueChip } = await supabase
            .from('blue_chip_art')
            .select('*')
            .order('created_at', { ascending: false });

        return NextResponse.json({
            config: config?.config_data || {},
            blueChip: blueChip || [],
            userStats,
            recentActivity,
            activeLocks,
            chartData
        });

    } catch (error) {
        console.error('Error fetching token platform data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
