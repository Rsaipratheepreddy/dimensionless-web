import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TattoosService } from './tattoos.service';
import { TattoosController } from './tattoos.controller';
import { Tattoo } from './entities/tattoo.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tattoo]),
        StorageModule,
    ],
    controllers: [TattoosController],
    providers: [TattoosService],
    exports: [TattoosService],
})
export class TattoosModule { }
