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
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ArtClassesService } from './art-classes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { StorageService } from '../storage/storage.service';

@ApiTags('art-classes')
@Controller('art-classes')
export class ArtClassesController {
    constructor(
        private readonly artClassesService: ArtClassesService,
        private readonly storageService: StorageService,
    ) {}

    @Get()
    findAll(
        @Query() paginationDto: PaginationDto,
        @Query('is_active') is_active?: boolean,
        @Query('level') level?: string,
    ) {
        return this.artClassesService.findAll(paginationDto, { is_active, level });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.artClassesService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    create(@Body() createData: any) {
        return this.artClassesService.create(createData);
    }

    @Post('upload')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const imageUrl = await this.storageService.uploadFile(file, 'art-classes');
        return { image_url: imageUrl };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.artClassesService.update(id, updateData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.artClassesService.remove(id);
    }
}
