import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private cloudfrontDomain: string;

    constructor(private configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION') || 'ap-south-1',
        });
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');
        this.cloudfrontDomain = this.configService.get<string>('CLOUDFRONT_DOMAIN') || '';
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string,
    ): Promise<string> {
        const key = `${folder}/${uuidv4()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            CacheControl: 'public, max-age=31536000',
        });

        await this.s3Client.send(command);

        return this.cloudfrontDomain
            ? `https://${this.cloudfrontDomain}/${key}`
            : `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        const key = fileUrl.split('.com/')[1];

        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client.send(command);
    }

    async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }
}
