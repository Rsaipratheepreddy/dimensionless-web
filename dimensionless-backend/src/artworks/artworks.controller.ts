import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
    Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ArtworksService } from './artworks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('artworks')
@Controller('artworks')
export class ArtworksController {
    constructor(
        private readonly artworksService: ArtworksService,
        private readonly storageService: StorageService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    @Get()
    async findAll(
        @Query() paginationDto: PaginationDto,
        @Query('status') status?: string,
        @Query('category') category?: string,
        @Query('artist_id') artist_id?: string,
    ) {
        const cacheKey = `artworks_${paginationDto.page || 1}_${paginationDto.limit || 20}_${status || 'all'}_${category || 'all'}_${artist_id || 'all'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const data = await this.artworksService.findAll(paginationDto, { status, category, artist_id });
        await this.cacheManager.set(cacheKey, data, 300);
        return data;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.artworksService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CREATOR, UserRole.ADMIN)
    @ApiBearerAuth()
    create(@Request() req, @Body() createData: any) {
        return this.artworksService.create({
            ...createData,
            artist_id: req.user.id,
        });
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CREATOR, UserRole.ADMIN)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.artworksService.update(id, updateData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CREATOR, UserRole.ADMIN)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.artworksService.remove(id);
    }

    @Post(':id/images')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        const imageUrl = await this.storageService.uploadFile(file, 'artworks');
        return this.artworksService.addImage(id, {
            image_url: imageUrl,
            is_primary: body.is_primary === 'true',
            display_order: parseInt(body.display_order || '0'),
        });
    }

    @Delete('images/:imageId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removeImage(@Param('imageId') imageId: string) {
        return this.artworksService.removeImage(imageId);
    }
}
