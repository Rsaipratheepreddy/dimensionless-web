import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HomeService } from './home.service';

@ApiTags('home')
@Controller('home')
export class HomeController {
    constructor(
        private readonly homeService: HomeService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    @Get()
    async getHomeData() {
        const cacheKey = 'home_data';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const data = await this.homeService.getHomeData();
        await this.cacheManager.set(cacheKey, data, 300); // 5 min TTL
        return data;
    }
}
