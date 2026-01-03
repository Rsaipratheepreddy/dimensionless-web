'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

export default function ShippingPolicyPage() {
    return (
        <AppLayout>
            <div className="legal-page-container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '24px', fontSize: '2.5rem', fontWeight: '700' }}>Shipping & Delivery Policy</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Last updated on Dec 20th 2025</p>

                <div className="legal-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                    <p>
                        For International buyers, orders are shipped and delivered through registered international courier
                        companies and/or International speed post only. For domestic buyers, orders are shipped through
                        registered domestic courier companies and /or speed post only.
                    </p>

                    <p>
                        Orders are shipped within 0-7 days or as per the delivery date agreed at the time of order confirmation
                        and delivering of the shipment subject to Courier Company / post office norms.
                    </p>

                    <p>
                        DIMENSIONLESS CREATIVE STUDIOS PRIVATE LIMITED is not liable for any delay in delivery by the courier
                        company / postal authorities and only guarantees to hand over the consignment to the courier company or
                        postal authorities within 0-7 days from the date of the order and payment or as per the delivery date
                        agreed at the time of order confirmation.
                    </p>

                    <p>
                        Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be
                        confirmed on your mail ID as specified during registration.
                    </p>

                    <p>
                        For any issues in utilizing our services you may contact our helpdesk on 9731723023 or
                        dimensionlestudios@gmail.com
                    </p>

                    <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        Disclaimer: The above content is created at DIMENSIONLESS CREATIVE STUDIOS PRIVATE LIMITED's
                        sole discretion. Razorpay shall not be liable for any content provided here and shall not be
                        responsible for any claims and liability that may arise due to merchant’s non-adherence to it.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
