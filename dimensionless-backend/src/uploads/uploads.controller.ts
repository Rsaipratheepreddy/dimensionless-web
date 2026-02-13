import {
    Controller,
    Post,
    Delete,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Body,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
    constructor(private readonly s3Service: S3Service) { }

    @Post('single')
    @ApiOperation({ summary: 'Upload a single file to S3' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                folder: {
                    type: 'string',
                    description: 'Optional folder path in S3',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadSingle(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder?: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const result = await this.s3Service.uploadFile(file, folder || 'uploads');

        return {
            message: 'File uploaded successfully',
            data: result,
        };
    }

    @Post('multiple')
    @ApiOperation({ summary: 'Upload multiple files to S3' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                folder: {
                    type: 'string',
                    description: 'Optional folder path in S3',
                },
            },
        },
    })
    @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
    async uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('folder') folder?: string,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        const results = await this.s3Service.uploadFiles(files, folder || 'uploads');

        return {
            message: `${results.length} file(s) uploaded successfully`,
            data: results,
        };
    }

    @Delete('single')
    @ApiOperation({ summary: 'Delete a file from S3' })
    async deleteSingle(@Body('key') key: string) {
        if (!key) {
            throw new BadRequestException('File key is required');
        }

        await this.s3Service.deleteFile(key);

        return {
            message: 'File deleted successfully',
        };
    }

    @Delete('multiple')
    @ApiOperation({ summary: 'Delete multiple files from S3' })
    async deleteMultiple(@Body('keys') keys: string[]) {
        if (!keys || keys.length === 0) {
            throw new BadRequestException('File keys are required');
        }

        await this.s3Service.deleteFiles(keys);

        return {
            message: `${keys.length} file(s) deleted successfully`,
        };
    }

    @Post('presigned-url')
    @ApiOperation({ summary: 'Get presigned URL for direct frontend upload' })
    async getPresignedUploadUrl(
        @Body('fileName') fileName: string,
        @Body('contentType') contentType: string,
        @Body('folder') folder?: string,
    ) {
        if (!fileName || !contentType) {
            throw new BadRequestException('fileName and contentType are required');
        }

        const result = await this.s3Service.getPresignedUploadUrl(
            fileName,
            contentType,
            folder || 'uploads',
        );

        return {
            message: 'Presigned URL generated successfully',
            data: result,
        };
    }
}
