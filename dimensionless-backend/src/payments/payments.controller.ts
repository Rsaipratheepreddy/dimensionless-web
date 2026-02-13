import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * Create a Razorpay order
     * POST /api/payments/create-order
     */
    @Post('create-order')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            properties: {
                amount: { type: 'number', example: 500 },
                currency: { type: 'string', example: 'INR' },
                receipt: { type: 'string', example: 'receipt_123' },
            },
        },
    })
    async createOrder(@Body() createOrderDto: any) {
        return this.paymentsService.createOrder(createOrderDto);
    }

    /**
     * Verify payment after successful payment
     * POST /api/payments/verify
     */
    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            properties: {
                razorpay_order_id: { type: 'string' },
                razorpay_payment_id: { type: 'string' },
                razorpay_signature: { type: 'string' },
            },
        },
    })
    async verifyPayment(@Body() verifyPaymentDto: any) {
        return this.paymentsService.verifyPayment(verifyPaymentDto);
    }

    /**
     * Get payment details
     * GET /api/payments/:paymentId
     */
    @Get(':paymentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getPaymentDetails(@Param('paymentId') paymentId: string) {
        return this.paymentsService.getPaymentDetails(paymentId);
    }

    /**
     * Process refund
     * POST /api/payments/:paymentId/refund
     */
    @Post(':paymentId/refund')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            properties: {
                amount: {
                    type: 'number',
                    example: 100,
                    description: 'Optional partial refund amount',
                },
            },
        },
    })
    async processRefund(
        @Param('paymentId') paymentId: string,
        @Body() body: { amount?: number },
    ) {
        return this.paymentsService.processRefund(paymentId, body.amount);
    }

    /**
     * Get refund status
     * GET /api/payments/refund/:refundId
     */
    @Get('refund/:refundId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getRefundStatus(@Param('refundId') refundId: string) {
        return this.paymentsService.getRefundStatus(refundId);
    }

    /**
     * Get Razorpay config (for frontend)
     * GET /api/payments/config
     */
    @Get('config/razorpay')
    getRazorpayConfig() {
        return {
            key_id: process.env.RAZORPAY_KEY_ID,
        };
    }
}
