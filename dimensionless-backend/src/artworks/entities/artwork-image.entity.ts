import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Artwork } from './artwork.entity';

@Entity('artwork_images')
export class ArtworkImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    artwork_id: string;

    @ManyToOne(() => Artwork, (artwork) => artwork.images, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'artwork_id' })
    artwork: Artwork;

    @Column()
    image_url: string;

    @Column({ default: 0 })
    display_order: number;

    @Column({ default: false })
    is_primary: boolean;

    @CreateDateColumn()
    created_at: Date;
}
