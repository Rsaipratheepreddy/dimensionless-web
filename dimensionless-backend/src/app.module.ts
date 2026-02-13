import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

import { EventsModule } from './events/events.module';
import { TattoosModule } from './tattoos/tattoos.module';
import { PiercingsModule } from './piercings/piercings.module';
import { PaymentsModule } from './payments/payments.module';
import { StorageModule } from './storage/storage.module';
import { CategoriesModule } from './categories/categories.module';
import { BookingsModule } from './bookings/bookings.module';
import { ArtClassesModule } from './art-classes/art-classes.module';
import { ArtworksModule } from './artworks/artworks.module';
import { UsersModule } from './users/users.module';
import { S3Module } from './s3/s3.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database - Now enabled with Docker PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'dimensionless',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ArtworksModule,
    EventsModule,
    TattoosModule,
    PiercingsModule,
    PaymentsModule,
    StorageModule,
    CategoriesModule,
    BookingsModule,
    ArtClassesModule,
    S3Module,
    UploadsModule,
  ],
})
export class AppModule { }
