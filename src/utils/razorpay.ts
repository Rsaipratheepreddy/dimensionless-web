import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RtwhZZFSvgR3el',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'TjHL4rwHo1jV4PlB791LVNUt',
});
