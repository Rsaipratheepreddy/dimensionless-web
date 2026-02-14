import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
    imports: [
        NestCacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                store: redisStore,
                host: configService.get('REDIS_HOST') || 'localhost',
                port: configService.get('REDIS_PORT') || 6379,
                ttl: 300, // 5 minutes default
                max: 100,
            }),
        }),
    ],
    exports: [NestCacheModule],
})
export class CacheModule { }
