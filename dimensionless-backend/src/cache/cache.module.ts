import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        NestCacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService): any => {
                const redisHost = configService.get<string>('REDIS_HOST');
                if (redisHost) {
                    const redisStore = require('cache-manager-redis-store');
                    return {
                        store: redisStore,
                        host: redisHost,
                        port: parseInt(configService.get<string>('REDIS_PORT') || '6379'),
                        ttl: 300,
                        max: 500,
                    };
                }
                return { ttl: 300, max: 100 };
            },
        }),
    ],
    exports: [NestCacheModule],
})
export class CacheModule { }
