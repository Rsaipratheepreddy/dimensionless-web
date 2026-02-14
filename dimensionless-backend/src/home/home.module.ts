import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { ArtworksModule } from '../artworks/artworks.module';
import { TattoosModule } from '../tattoos/tattoos.module';

@Module({
    imports: [
        ArtworksModule,
        TattoosModule,
    ],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule { }
