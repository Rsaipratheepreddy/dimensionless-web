import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';

@Injectable()
export class StorageService {
    constructor(private s3Service: S3Service) { }

    async uploadFile(
        file: Express.Multer.File,
        folder: string,
    ): Promise<string> {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type');
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File too large');
        }

        return this.s3Service.uploadFile(file, folder);
    }

    async deleteFile(fileUrl: string): Promise<void> {
        return this.s3Service.deleteFile(fileUrl);
    }

    async getPresignedUrl(key: string): Promise<string> {
        return this.s3Service.getPresignedUrl(key);
    }
}
