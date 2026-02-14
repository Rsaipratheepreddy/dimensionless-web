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
import { PiercingsService } from './piercings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { StorageService } from '../storage/storage.service';

@ApiTags('piercings')
@Controller('piercings')
export class PiercingsController {
    constructor(
        private readonly piercingsService: PiercingsService,
        private readonly storageService: StorageService,
    ) {}

    @Get()
    findAll(
        @Query() paginationDto: PaginationDto,
        @Query('is_active') is_active?: boolean,
        @Query('location') location?: string,
    ) {
        return this.piercingsService.findAll(paginationDto, { is_active, location });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.piercingsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    create(@Body() createData: any) {
        return this.piercingsService.create(createData);
    }

    @Post('upload')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const imageUrl = await this.storageService.uploadFile(file, 'piercings');
        return { image_url: imageUrl };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.piercingsService.update(id, updateData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.piercingsService.remove(id);
    }
}
