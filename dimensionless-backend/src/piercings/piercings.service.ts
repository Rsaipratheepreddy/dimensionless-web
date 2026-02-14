import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piercing } from './entities/piercing.entity';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class PiercingsService {
    constructor(
        @InjectRepository(Piercing)
        private piercingsRepository: Repository<Piercing>,
    ) {}

    async create(piercingData: Partial<Piercing>): Promise<Piercing> {
        const piercing = this.piercingsRepository.create(piercingData);
        return this.piercingsRepository.save(piercing);
    }

    async findAll(
        paginationDto: PaginationDto,
        filters?: {
            is_active?: boolean;
            location?: string;
        }
    ): Promise<PaginatedResponse<Piercing>> {
        const { page = 1, limit = 20 } = paginationDto;
        const skip = (page - 1) * limit;

        const query = this.piercingsRepository
            .createQueryBuilder('piercing')
            .orderBy('piercing.created_at', 'DESC');

        if (filters?.is_active !== undefined) {
            query.andWhere('piercing.is_active = :is_active', { is_active: filters.is_active });
        }
        if (filters?.location) {
            query.andWhere('piercing.location = :location', {
                location: filters.location,
            });
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

    async findOne(id: string): Promise<Piercing> {
        const piercing = await this.piercingsRepository.findOne({
            where: { id },
        });

        if (!piercing) {
            throw new NotFoundException(`Piercing with ID ${id} not found`);
        }

        return piercing;
    }

    async update(id: string, updateData: Partial<Piercing>): Promise<Piercing> {
        await this.piercingsRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const result = await this.piercingsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Piercing with ID ${id} not found`);
        }
    }
}
