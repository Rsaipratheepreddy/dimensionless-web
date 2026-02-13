import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import { StorageService } from './storage.service';


@Module({
    imports: [ConfigModule],
    providers: [S3Service, StorageService],
    exports: [StorageService],
})
export class StorageModule { }
