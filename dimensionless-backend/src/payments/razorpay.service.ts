import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
    private razorpay: any;

    constructor(private configService: ConfigService) {
        const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

        // Only initialize if keys are provided
        if (keyId && keySecret && keyId !== 'your_razorpay_key_id') {
            this.razorpay = new Razorpay({
                key_id: keyId,
                key_secret: keySecret,
            });
        }
    }

    /**
     * Create a Razorpay order
     */
    async createOrder(amount: number, currency: string = 'INR', receipt?: string) {
        if (!this.razorpay) {
            throw new Error('Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        return this.razorpay.orders.create(options);
    }

    /**
     * Verify Razorpay payment signature
     */
    verifyPaymentSignature(
        orderId: string,
        paymentId: string,
        signature: string,
    ): boolean {
        if (!this.razorpay) {
            return false;
        }

        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET'))
            .update(body.toString())
            .digest('hex');

        return expectedSignature === signature;
    }

    /**
     * Fetch payment details
     */
    async getPayment(paymentId: string) {
        if (!this.razorpay) {
            throw new Error('Razorpay not configured');
        }
        return this.razorpay.payments.fetch(paymentId);
    }

    /**
     * Capture payment (for authorized payments)
     */
    async capturePayment(paymentId: string, amount: number, currency: string = 'INR') {
        if (!this.razorpay) {
            throw new Error('Razorpay not configured');
        }
        return this.razorpay.payments.capture(paymentId, amount * 100, currency);
    }

    /**
     * Initiate refund
     */
    async createRefund(paymentId: string, amount?: number) {
        if (!this.razorpay) {
            throw new Error('Razorpay not configured');
        }
        const options: any = { payment_id: paymentId };
        if (amount) {
            options.amount = amount * 100; // Amount in paise
        }
        return this.razorpay.payments.refund(paymentId, options);
    }

    /**
     * Fetch refund details
     */
    async getRefund(refundId: string) {
        if (!this.razorpay) {
            throw new Error('Razorpay not configured');
        }
        return this.razorpay.refunds.fetch(refundId);
    }

    /**
     * Get all refunds for a payment
     */
    async getAllRefunds(paymentId: string) {
        if (!this.razorpay) {
            throw new Error('Razorpay not configured');
        }
        return this.razorpay.payments.fetchMultipleRefund(paymentId);
    }
}
