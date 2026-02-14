import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tattoo } from './entities/tattoo.entity';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class TattoosService {
    constructor(
        @InjectRepository(Tattoo)
        private tattoosRepository: Repository<Tattoo>,
    ) {}

    async create(tattooData: Partial<Tattoo>): Promise<Tattoo> {
        const tattoo = this.tattoosRepository.create(tattooData);
        return this.tattoosRepository.save(tattoo);
    }

    async findAll(
        paginationDto: PaginationDto,
        filters?: {
            is_active?: boolean;
            category_id?: string;
        }
    ): Promise<PaginatedResponse<Tattoo>> {
        const { page = 1, limit = 20 } = paginationDto;
        const skip = (page - 1) * limit;

        const query = this.tattoosRepository
            .createQueryBuilder('tattoo')
            .orderBy('tattoo.created_at', 'DESC');

        if (filters?.is_active !== undefined) {
            query.andWhere('tattoo.is_active = :is_active', { is_active: filters.is_active });
        }
        if (filters?.category_id) {
            query.andWhere('tattoo.category_id = :category_id', {
                category_id: filters.category_id,
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

    async findOne(id: string): Promise<Tattoo> {
        const tattoo = await this.tattoosRepository.findOne({
            where: { id },
        });

        if (!tattoo) {
            throw new NotFoundException(`Tattoo with ID ${id} not found`);
        }

        return tattoo;
    }

    async update(id: string, updateData: Partial<Tattoo>): Promise<Tattoo> {
        await this.tattoosRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const result = await this.tattoosRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Tattoo with ID ${id} not found`);
        }
    }
}
