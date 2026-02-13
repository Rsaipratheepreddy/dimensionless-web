import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');

        this.s3Client = new S3Client({
            region,
            // If running on EC2/EB, credentials are automatically loaded from IAM role
            // For local development, use AWS CLI credentials or environment variables
        });
    }

    /**
     * Upload a file to S3
     */
    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'uploads',
    ): Promise<{ key: string; url: string }> {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read', // Uncomment if you want files to be publicly accessible
        });

        await this.s3Client.send(command);

        // Return the S3 key and URL
        return {
            key: fileName,
            url: `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${fileName}`,
        };
    }

    /**
     * Upload multiple files to S3
     */
    async uploadFiles(
        files: Express.Multer.File[],
        folder: string = 'uploads',
    ): Promise<{ key: string; url: string }[]> {
        const uploadPromises = files.map(file => this.uploadFile(file, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * Delete a file from S3
     */
    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client.send(command);
    }

    /**
     * Delete multiple files from S3
     */
    async deleteFiles(keys: string[]): Promise<void> {
        const deletePromises = keys.map(key => this.deleteFile(key));
        await Promise.all(deletePromises);
    }

    /**
     * Generate a presigned URL for secure file access
     * Useful when S3 bucket is private
     */
    async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    /**
     * Generate presigned URLs for multiple files
     */
    async getPresignedUrls(keys: string[], expiresIn: number = 3600): Promise<string[]> {
        const urlPromises = keys.map(key => this.getPresignedUrl(key, expiresIn));
        return Promise.all(urlPromises);
    }

    /**
     * Generate a presigned URL for uploading directly from frontend
     */
    async getPresignedUploadUrl(
        fileName: string,
        contentType: string,
        folder: string = 'uploads',
        expiresIn: number = 3600,
    ): Promise<{ key: string; uploadUrl: string }> {
        const fileExtension = fileName.split('.').pop();
        const key = `${folder}/${uuidv4()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

        return { key, uploadUrl };
    }
}
