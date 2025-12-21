'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import AppLayout from '@/components/AppLayout';
import { IconShieldCheck, IconArrowLeft, IconLoader2, IconCircleCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import './page.css';

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) {
            // Option to redirect to login if needed
        }
    }, [user]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!user) {
            toast.error('Please sign in to complete your purchase.');
            return;
        }

        const res = await loadRazorpay();
        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            setLoading(true);

            // For multiple items, we create one order with total amount
            // Note: In a real app, you might want to create separate orders 
            // but for this MVP we'll treat the cart as one transaction
            const orderRes = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paintingId: cartItems[0].id, // Primary item reference
                    amount: cartTotal
                })
            });

            const orderData = await orderRes.json();
            if (orderData.error) throw new Error(orderData.details || orderData.error);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RtwhZZFSvgR3el',
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Dimensionless",
                description: `Purchase of ${cartItems.length} artworks`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // Call verify for each item in the cart
                    const verifyPromises = cartItems.map(item =>
                        fetch('/api/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...response,
                                paintingId: item.id,
                                buyerId: user.id
                            })
                        }).then(r => r.json())
                    );

                    const results = await Promise.all(verifyPromises);
                    const allSuccess = results.every(res => res.success);

                    if (allSuccess) {
                        setSuccess(true);
                        clearCart();
                        toast.success('Payment successful!');
                    } else {
                        toast.error('Some items failed verification. Please contact support.');
                    }
                },
                prefill: {
                    name: profile?.full_name || "",
                    email: user.email || ""
                },
                theme: {
                    color: "#5b4fe8"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error('Payment failed:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AppLayout>
                <div className="checkout-container success">
                    <div className="success-card">
                        <div className="success-icon">
                            <IconCircleCheck size={64} />
                        </div>
                        <h1>Order Successful!</h1>
                        <p>Thank you for supporting great artists. You can find your purchases in your order history.</p>
                        <div className="success-actions">
                            <Link href="/orders" className="view-orders-btn">View My Orders</Link>
                            <Link href="/buy-art" className="back-market-btn">Back to Marketplace</Link>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (cartItems.length === 0) {
        return (
            <AppLayout>
                <div className="checkout-container">
                    <p>Your cart is empty. <Link href="/buy-art">Go browse some art!</Link></p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="checkout-container">
                <div className="checkout-header">
                    <Link href="/cart" className="back-link">
                        <IconArrowLeft size={20} />
                        <span>Back to Cart</span>
                    </Link>
                    <h1>Finalize Your Order</h1>
                </div>

                <div className="checkout-grid">
                    <div className="checkout-form-section">
                        <div className="checkout-section">
                            <h3>1. Contact Information</h3>
                            <div className="user-summary-card">
                                <img src={profile?.avatar_url || "/founder1.png"} alt="Avatar" />
                                <div className="user-details">
                                    <strong>{profile?.full_name}</strong>
                                    <span>{user?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-section">
                            <h3>2. Payment Method</h3>
                            <div className="payment-method-card active">
                                <div className="payment-info">
                                    <IconShieldCheck size={24} />
                                    <div>
                                        <strong>Secure Checkout with Razorpay</strong>
                                        <span>UPI, Cards, NetBanking available</span>
                                    </div>
                                </div>
                                <div className="radio-circle active"></div>
                            </div>
                        </div>
                    </div>

                    <div className="checkout-summary-section">
                        <div className="order-summary-card">
                            <h3>Order Summary</h3>
                            <div className="items-preview">
                                {cartItems.map(item => (
                                    <div key={item.id} className="preview-item">
                                        <span>{item.title}</span>
                                        <span>₹{item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="divider"></div>
                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-line">
                                <span>Tax (Inc.)</span>
                                <span>₹0</span>
                            </div>
                            <div className="total-line">
                                <span>Payable Amount</span>
                                <span>₹{cartTotal.toLocaleString()}</span>
                            </div>

                            <button
                                className="pay-now-btn"
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <IconLoader2 className="animate-spin" size={20} />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>Pay ₹{cartTotal.toLocaleString()}</>
                                )}
                            </button>

                            <p className="secure-badge">
                                <IconShieldCheck size={14} />
                                Encrypted Secure Payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
