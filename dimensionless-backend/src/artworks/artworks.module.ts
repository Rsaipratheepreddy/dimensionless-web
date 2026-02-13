import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworksService } from './artworks.service';
import { ArtworksController } from './artworks.controller';
import { Artwork } from './entities/artwork.entity';
import { ArtworkImage } from './entities/artwork-image.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Artwork, ArtworkImage]),
        StorageModule,
    ],
    controllers: [ArtworksController],
    providers: [ArtworksService],
    exports: [ArtworksService],
})
export class ArtworksModule { }
