import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { ArtworksModule } from '../artworks/artworks.module';
import { TattoosModule } from '../tattoos/tattoos.module';
import { PiercingsModule } from '../piercings/piercings.module';
import { ArtClassesModule } from '../art-classes/art-classes.module';

@Module({
    imports: [
        ArtworksModule,
        TattoosModule,
        PiercingsModule,
        ArtClassesModule,
    ],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule {}
