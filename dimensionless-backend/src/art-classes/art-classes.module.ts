import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtClassesService } from './art-classes.service';
import { ArtClassesController } from './art-classes.controller';
import { ArtClass } from './entities/art-class.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ArtClass]),
        StorageModule,
    ],
    controllers: [ArtClassesController],
    providers: [ArtClassesService],
    exports: [ArtClassesService],
})
export class ArtClassesModule { }
