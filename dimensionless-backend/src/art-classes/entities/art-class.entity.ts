import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('art_classes')
export class ArtClass {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    instructor: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column({ nullable: true })
    duration: string;

    @Column({ nullable: true })
    level: string;

    @Column({ type: 'int', default: 0 })
    max_students: number;

    @Column({ nullable: true })
    image_url: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'uuid', nullable: true })
    category_id: string;

    @Column({ type: 'timestamp', nullable: true })
    start_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
