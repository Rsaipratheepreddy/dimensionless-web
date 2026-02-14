import { Injectable } from '@nestjs/common';
import { ArtworksService } from '../artworks/artworks.service';
import { TattoosService } from '../tattoos/tattoos.service';
import { PiercingsService } from '../piercings/piercings.service';
import { ArtClassesService } from '../art-classes/art-classes.service';

@Injectable()
export class HomeService {
    constructor(
        private artworksService: ArtworksService,
        private tattoosService: TattoosService,
        private piercingsService: PiercingsService,
        private artClassesService: ArtClassesService,
    ) {}

    async getHomeData() {
        const [artworks, tattoos, piercings, artClasses] = await Promise.all([
            this.artworksService.findAll({ page: 1, limit: 6 }, { status: 'published' as any }),
            this.tattoosService.findAll({ page: 1, limit: 6 }, { is_active: true }),
            this.piercingsService.findAll({ page: 1, limit: 6 }, { is_active: true }),
            this.artClassesService.findAll({ page: 1, limit: 6 }),
        ]);

        return {
            artworks: artworks.data,
            tattoos: tattoos.data,
            piercings: piercings.data,
            artClasses: artClasses.data,
        };
    }
}
