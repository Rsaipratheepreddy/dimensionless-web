import { Injectable, BadRequestException } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';

export interface CreateOrderDto {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, any>;
}

export interface VerifyPaymentDto {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

@Injectable()
export class PaymentsService {
    constructor(private razorpayService: RazorpayService) { }

    /**
     * Create a new payment order
     */
    async createOrder(createOrderDto: CreateOrderDto) {
        const { amount, currency, receipt } = createOrderDto;

        if (!amount || amount <= 0) {
            throw new BadRequestException('Invalid amount');
        }

        const order = await this.razorpayService.createOrder(
            amount,
            currency || 'INR',
            receipt,
        );

        return {
            orderId: order.id,
            amount: Number(order.amount) / 100, // Convert back to rupees
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
        };
    }

    /**
     * Verify payment after successful payment
     */
    async verifyPayment(verifyPaymentDto: VerifyPaymentDto) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            verifyPaymentDto;

        const isValid = this.razorpayService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        );

        if (!isValid) {
            throw new BadRequestException('Invalid payment signature');
        }

        // Fetch payment details
        const payment = await this.razorpayService.getPayment(razorpay_payment_id);

        return {
            verified: true,
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: Number(payment.amount) / 100,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            email: payment.email,
            contact: payment.contact,
        };
    }

    /**
     * Get payment details
     */
    async getPaymentDetails(paymentId: string) {
        const payment = await this.razorpayService.getPayment(paymentId);

        return {
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: Number(payment.amount) / 100,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            email: payment.email,
            contact: payment.contact,
            createdAt: new Date(payment.created_at * 1000),
        };
    }

    /**
     * Process refund
     */
    async processRefund(paymentId: string, amount?: number) {
        const refund = await this.razorpayService.createRefund(paymentId, amount);

        return {
            refundId: refund.id,
            paymentId: refund.payment_id,
            amount: Number(refund.amount) / 100,
            currency: refund.currency,
            status: refund.status,
            createdAt: new Date(refund.created_at * 1000),
        };
    }

    /**
     * Get refund status
     */
    async getRefundStatus(refundId: string) {
        const refund = await this.razorpayService.getRefund(refundId);

        return {
            refundId: refund.id,
            paymentId: refund.payment_id,
            amount: Number(refund.amount) / 100,
            status: refund.status,
            createdAt: new Date(refund.created_at * 1000),
        };
    }
}
