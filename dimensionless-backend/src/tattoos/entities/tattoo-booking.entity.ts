import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('tattoo_bookings')
export class TattooBooking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid', nullable: true })
    design_id: string;

    @Column({ type: 'uuid', nullable: true })
    slot_id: string;

    @Column({ type: 'date' })
    booking_date: Date;

    @Column({ type: 'time' })
    booking_time: string;

    @Column({ type: 'uuid', nullable: true })
    artist_id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    final_price: number;

    @Column()
    payment_method: string;

    @Column({ default: 'pending' })
    payment_status: string;

    @Column({ nullable: true })
    payment_id: string;

    @Column({ nullable: true })
    razorpay_order_id: string;

    @Column({ default: 'pending' })
    status: string;

    @Column({ type: 'text', nullable: true })
    custom_notes: string;

    @Column({ type: 'text', array: true, nullable: true })
    reference_images: string[];

    @Column({ nullable: true })
    user_mobile: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
