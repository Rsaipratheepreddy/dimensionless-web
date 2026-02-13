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

    @Column({
        type: 'enum',
        enum: ArtworkStatus,
        default: ArtworkStatus.DRAFT,
    })
    status: ArtworkStatus;

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

    @OneToMany(() => ArtworkImage, (image) => image.artwork)
    images: ArtworkImage[];
}
