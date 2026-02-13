import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// PATCH /api/bookings/[bookingId] - Update booking status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const { bookingId } = await params;
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}

// GET /api/bookings/[bookingId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const { bookingId } = await params;
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/bookings/${bookingId}`, { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
}
