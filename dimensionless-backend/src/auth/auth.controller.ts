import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiBody({
        schema: {
            properties: {
                email: { type: 'string' },
                password: { type: 'string' },
                full_name: { type: 'string' },
                phone: { type: 'string' },
            },
        },
    })
    async register(@Body() registerDto: any) {
        return this.authService.register(registerDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiBody({
        schema: {
            properties: {
                email: { type: 'string' },
                password: { type: 'string' },
            },
        },
    })
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
}
