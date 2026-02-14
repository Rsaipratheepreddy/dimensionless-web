import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TattoosModule } from './tattoos/tattoos.module';
import { PiercingsModule } from './piercings/piercings.module';
import { StorageModule } from './storage/storage.module';
import { CategoriesModule } from './categories/categories.module';
import { ArtClassesModule } from './art-classes/art-classes.module';
import { ArtworksModule } from './artworks/artworks.module';
import { UsersModule } from './users/users.module';
import { UploadsModule } from './uploads/uploads.module';
import { HomeModule } from './home/home.module';
import { CacheModule } from './cache/cache.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Cache
    CacheModule,

    // Database
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

    // Core Feature Modules
    AuthModule,
    UsersModule,
    HomeModule,
    ArtworksModule,
    TattoosModule,
    PiercingsModule,
    ArtClassesModule,

    // Utility Modules
    StorageModule,
    CategoriesModule,
    UploadsModule,
  ],
})
export class AppModule { }
