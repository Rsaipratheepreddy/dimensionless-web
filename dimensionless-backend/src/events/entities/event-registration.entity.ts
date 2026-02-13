import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('event_registrations')
export class EventRegistration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    event_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn()
    registration_date: Date;

    @Column({ default: 'confirmed' })
    status: string;

    @Column({ default: 'unpaid' })
    payment_status: string;

    @Column({ nullable: true })
    razorpay_order_id: string;

    @Column({ nullable: true })
    razorpay_payment_id: string;

    @Column({ nullable: true })
    razorpay_signature: string;

    @CreateDateColumn()
    created_at: Date;
}
