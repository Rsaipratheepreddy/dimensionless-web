import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtClass } from './entities/art-class.entity';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class ArtClassesService {
    constructor(
        @InjectRepository(ArtClass)
        private artClassesRepository: Repository<ArtClass>,
    ) {}

    async create(classData: Partial<ArtClass>): Promise<ArtClass> {
        const artClass = this.artClassesRepository.create(classData);
        return this.artClassesRepository.save(artClass);
    }

    async findAll(
        paginationDto: PaginationDto,
        filters?: {
            is_active?: boolean;
            level?: string;
        }
    ): Promise<PaginatedResponse<ArtClass>> {
        const { page = 1, limit = 20 } = paginationDto;
        const skip = (page - 1) * limit;

        const query = this.artClassesRepository
            .createQueryBuilder('artClass')
            .orderBy('artClass.created_at', 'DESC');

        if (filters?.is_active !== undefined) {
            query.andWhere('artClass.is_active = :is_active', { is_active: filters.is_active });
        }
        if (filters?.level) {
            query.andWhere('artClass.level = :level', { level: filters.level });
        }

        const [data, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<ArtClass> {
        const artClass = await this.artClassesRepository.findOne({
            where: { id },
        });

        if (!artClass) {
            throw new NotFoundException(`Art class with ID ${id} not found`);
        }

        return artClass;
    }

    async update(id: string, updateData: Partial<ArtClass>): Promise<ArtClass> {
        await this.artClassesRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const result = await this.artClassesRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Art class with ID ${id} not found`);
        }
    }
}
