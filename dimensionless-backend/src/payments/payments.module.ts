import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { RazorpayService } from './razorpay.service';
import { PaymentsService } from './payments.service';

@Module({
    imports: [ConfigModule],
    controllers: [PaymentsController],
    providers: [PaymentsService, RazorpayService],
    exports: [PaymentsService, RazorpayService],
})
export class PaymentsModule { }
