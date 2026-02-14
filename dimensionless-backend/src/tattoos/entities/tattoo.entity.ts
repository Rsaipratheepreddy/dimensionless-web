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

@Entity('tattoo_designs')
export class Tattoo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    size: string;

    @Column({ nullable: true })
    estimated_duration: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    base_price: number;

    @Column({ nullable: true })
    image_url: string;

    @Column({ type: 'uuid', nullable: true })
    artist_id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'artist_id' })
    artist: User;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'uuid', nullable: true })
    category_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
