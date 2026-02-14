import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ArtworkImage } from './artwork-image.entity';

export enum ArtworkStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    SOLD = 'sold',
    LEASED = 'leased',
    ARCHIVED = 'archived',
}

@Entity('artworks')
export class Artwork {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    about: string;

    @Column({ type: 'uuid', nullable: true })
    artist_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'artist_id' })
    artist: User;

    @Column({ nullable: true })
    artist_name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    purchase_price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    lease_monthly_rate: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    lease_security_deposit: number;

    @Column({ nullable: true })
    medium: string;

    @Column({ nullable: true })
    dimensions: string;

    @Column({ type: 'int', nullable: true })
    year_created: number;

    @Column({ type: 'varchar', length: 50, default: 'draft' })
    status: string;

    @Column({ default: false })
    is_featured: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'timestamptz', nullable: true })
    published_at: Date;

    @Column({ type: 'text', array: true, nullable: true })
    tags: string[];

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'int', default: 1, nullable: true })
    stock_quantity: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    origin: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    design_style: string;

    @Column({ type: 'text', nullable: true })
    delivery_info: string;

    @Column({ type: 'jsonb', nullable: true })
    variants: any;

    @Column({ default: true, nullable: true })
    allow_purchase: boolean;

    @Column({ default: true, nullable: true })
    allow_lease: boolean;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    avg_rating: number;

    @Column({ type: 'int', default: 0, nullable: true })
    total_reviews: number;

    @OneToMany(() => ArtworkImage, (image) => image.artwork)
    images: ArtworkImage[];
}
