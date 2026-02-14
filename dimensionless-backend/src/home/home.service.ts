import { Injectable } from '@nestjs/common';
import { ArtworksService } from '../artworks/artworks.service';
import { TattoosService } from '../tattoos/tattoos.service';

@Injectable()
export class HomeService {
    constructor(
        private artworksService: ArtworksService,
        private tattoosService: TattoosService,
    ) { }

    async getHomeData() {
        const [artworks, tattoos] = await Promise.all([
            this.artworksService.findAll({ page: 1, limit: 6 }, { status: 'published' as any }),
            this.tattoosService.findAll({ page: 1, limit: 6 }, { is_active: true }),
        ]);

        return {
            artworks: artworks.data,
            tattoos: tattoos.data,
            piercings: [],
            artClasses: [],
        };
    }
}
