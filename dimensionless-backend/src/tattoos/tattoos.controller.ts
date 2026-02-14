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
import { TattoosService } from './tattoos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { StorageService } from '../storage/storage.service';

@ApiTags('tattoos')
@Controller('tattoos')
export class TattoosController {
    constructor(
        private readonly tattoosService: TattoosService,
        private readonly storageService: StorageService,
    ) {}

    @Get()
    findAll(
        @Query() paginationDto: PaginationDto,
        @Query('is_active') is_active?: boolean,
        @Query('category_id') category_id?: string,
    ) {
        return this.tattoosService.findAll(paginationDto, { is_active, category_id });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tattoosService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    create(@Request() req, @Body() createData: any) {
        return this.tattoosService.create({
            ...createData,
            artist_id: req.user.id,
        });
    }

    @Post('upload')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
    ) {
        const imageUrl = await this.storageService.uploadFile(file, 'tattoos');
        return { image_url: imageUrl };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.tattoosService.update(id, updateData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.tattoosService.remove(id);
    }
}
