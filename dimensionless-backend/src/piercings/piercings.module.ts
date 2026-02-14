import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PiercingsService } from './piercings.service';
import { PiercingsController } from './piercings.controller';
import { Piercing } from './entities/piercing.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Piercing]),
        StorageModule,
    ],
    controllers: [PiercingsController],
    providers: [PiercingsService],
    exports: [PiercingsService],
})
export class PiercingsModule { }
