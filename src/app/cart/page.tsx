'use client';
import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { IconTrash, IconShoppingCart, IconArrowRight, IconBrush, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import './page.css';

export default function CartPage() {
    const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();

    if (cartItems.length === 0) {
        return (
            <AppLayout>
                <div className="cart-container empty">
                    <div className="empty-cart-state">
                        <div className="icon-circle">
                            <IconShoppingCart size={48} stroke={1} />
                        </div>
                        <h1>Your cart is empty</h1>
                        <p>Looks like you haven't added any masterpieces yet.</p>
                        <Link href="/buy-art" className="browse-btn">
                            <IconBrush size={20} />
                            <span>Browse Artworks</span>
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <button className="clear-cart-btn" onClick={clearCart}>Clear All</button>
                </div>

                <div className="cart-content-grid">
                    <div className="cart-items-list">
                        {cartItems.map((item) => (
                            <div key={item.cartKey} className="cart-item-card">
                                <div className="item-image">
                                    <img src={item.image_url} alt={item.title} />
                                </div>
                                <div className="item-details">
                                    <div className="item-info">
                                        <h3>{item.title}</h3>
                                        <p>by {item.artist_name || 'Unknown Artist'}</p>
                                    </div>
                                    <div className="item-price">₹{item.price.toLocaleString()}</div>
                                </div>
                                <button
                                    className="remove-item-btn"
                                    onClick={() => removeFromCart(item.cartKey)}
                                    title="Remove"
                                >
                                    <IconX size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary-side">
                        <div className="summary-card">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Items ({cartItems.length})</span>
                                <span>₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="free">FREE</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total Price</span>
                                <span>₹{cartTotal.toLocaleString()}</span>
                            </div>

                            <Link href="/checkout" className="checkout-btn">
                                <span>Proceed to Checkout</span>
                                <IconArrowRight size={20} />
                            </Link>

                            <p className="summary-note">Secure payment processed via Razorpay</p>
                        </div>

                        <Link href="/" className="continue-shopping">
                            Continue Browsing
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
