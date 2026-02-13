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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ArtworksService } from './artworks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ArtworkStatus } from './entities/artwork.entity';
import { StorageService } from '../storage/storage.service';

@ApiTags('artworks')
@Controller('artworks')
export class ArtworksController {
    constructor(
        private readonly artworksService: ArtworksService,
        private readonly storageService: StorageService,
    ) { }

    @Get()
    findAll(
        @Query('status') status?: ArtworkStatus,
        @Query('category') category?: string,
        @Query('artist_id') artist_id?: string,
    ) {
        return this.artworksService.findAll({ status, category, artist_id });
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
            caption: body.caption,
        });
    }

    @Delete('images/:imageId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removeImage(@Param('imageId') imageId: string) {
        return this.artworksService.removeImage(imageId);
    }
}
