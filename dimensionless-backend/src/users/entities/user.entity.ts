import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
    ADMIN = 'admin',
    EMPLOYEE = 'employee',
    CREATOR = 'creator',
    MEMBER = 'member',
}

@Entity('profiles')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    full_name: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatar_url: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.MEMBER,
    })
    role: UserRole;

    @Column({ default: false })
    creator_verified: boolean;

    @Column({ nullable: true })
    shop_name: string;

    @Column({ type: 'text', nullable: true })
    shop_description: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.0 })
    commission_rate: number;

    @Column({ type: 'text', array: true, nullable: true })
    interests: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
