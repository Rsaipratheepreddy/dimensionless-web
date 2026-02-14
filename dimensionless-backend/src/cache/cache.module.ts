import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        NestCacheModule.register({
            ttl: 300, // 5 minutes default
            max: 100,
            isGlobal: true,
        }),
    ],
    exports: [NestCacheModule],
})
export class CacheModule { }
