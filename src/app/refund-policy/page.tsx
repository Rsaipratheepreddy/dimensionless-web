'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

export default function RefundPolicyPage() {
    return (
        <AppLayout>
            <div className="legal-page-container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '24px', fontSize: '2.5rem', fontWeight: '700' }}>Cancellation & Refund Policy</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Last updated on Dec 20th 2025</p>

                <div className="legal-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                    <p>
                        DIMENSIONLESS CREATIVE STUDIOS PRIVATE LIMITED believes in helping its customers as far as possible,
                        and has therefore a liberal cancellation policy. Under this policy:
                    </p>

                    <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li>
                            Cancellations will be considered only if the request is made within Same day of placing the order.
                            However, the cancellation request may not be entertained if the orders have been communicated to
                            the vendors/merchants and they have initiated the process of shipping them.
                        </li>
                        <li>
                            DIMENSIONLESS CREATIVE STUDIOS PRIVATE LIMITED does not accept cancellation requests for
                            perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer
                            establishes that the quality of product delivered is not good.
                        </li>
                        <li>
                            In case of receipt of damaged or defective items please report the same to our Customer Service
                            team. The request will, however, be entertained once the merchant has checked and determined the
                            same at his own end. This should be reported within Same day of receipt of the products.
                        </li>
                        <li>
                            In case you feel that the product received is not as shown on the site or as per your expectations, you
                            must bring it to the notice of our customer service within Same day of receiving the product. The
                            Customer Service Team after looking into your complaint will take an appropriate decision.
                        </li>
                        <li>
                            In case of complaints regarding products that come with a warranty from manufacturers, please refer
                            the issue to them.
                        </li>
                        <li>
                            In case of any Refunds approved by the DIMENSIONLESS CREATIVE STUDIOS PRIVATE LIMITED, it’ll
                            take 1-2 days for the refund to be processed to the end customer.
                        </li>
                    </ul>

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
