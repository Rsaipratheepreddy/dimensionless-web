import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artwork, ArtworkStatus } from './entities/artwork.entity';
import { ArtworkImage } from './entities/artwork-image.entity';

@Injectable()
export class ArtworksService {
    constructor(
        @InjectRepository(Artwork)
        private artworksRepository: Repository<Artwork>,
        @InjectRepository(ArtworkImage)
        private artworkImagesRepository: Repository<ArtworkImage>,
    ) { }

    async create(artworkData: Partial<Artwork>): Promise<Artwork> {
        const artwork = this.artworksRepository.create(artworkData);
        return this.artworksRepository.save(artwork);
    }

    async findAll(filters?: {
        status?: ArtworkStatus;
        category?: string;
        artist_id?: string;
    }): Promise<Artwork[]> {
        const query = this.artworksRepository
            .createQueryBuilder('artwork')
            .leftJoinAndSelect('artwork.images', 'images')
            .leftJoin('artwork.artist', 'artist')
            .addSelect(['artist.id', 'artist.email', 'artist.full_name'])
            .orderBy('artwork.created_at', 'DESC');

        if (filters?.status) {
            query.andWhere('artwork.status = :status', { status: filters.status });
        }
        if (filters?.category) {
            query.andWhere('artwork.category = :category', {
                category: filters.category,
            });
        }
        if (filters?.artist_id) {
            query.andWhere('artwork.artist_id = :artist_id', {
                artist_id: filters.artist_id,
            });
        }

        return query.getMany();
    }

    async findOne(id: string): Promise<Artwork> {
        const artwork = await this.artworksRepository.findOne({
            where: { id },
            relations: ['images', 'artist'],
        });

        if (!artwork) {
            throw new NotFoundException(`Artwork with ID ${id} not found`);
        }

        return artwork;
    }

    async update(id: string, updateData: Partial<Artwork>): Promise<Artwork> {
        await this.artworksRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const result = await this.artworksRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Artwork with ID ${id} not found`);
        }
    }

    async addImage(artworkId: string, imageData: Partial<ArtworkImage>) {
        const artwork = await this.findOne(artworkId);
        const image = this.artworkImagesRepository.create({
            ...imageData,
            artwork_id: artwork.id,
        });
        return this.artworkImagesRepository.save(image);
    }

    async removeImage(imageId: string): Promise<void> {
        await this.artworkImagesRepository.delete(imageId);
    }
}
