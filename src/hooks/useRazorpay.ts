import { useEffect, useState } from 'react';

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: any) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const useRazorpay = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setIsLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const openCheckout = (options: RazorpayOptions) => {
        if (!isLoaded) {
            console.error('Razorpay SDK not loaded');
            return;
        }

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    return { isLoaded, openCheckout };
};
