import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await this.usersService.validatePassword(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: User) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                avatar_url: user.avatar_url,
            },
        };
    }

    async register(userData: {
        email: string;
        password: string;
        full_name?: string;
        phone?: string;
    }) {
        // Check if user exists
        const existingUser = await this.usersService.findByEmail(userData.email);
        if (existingUser) {
            throw new UnauthorizedException('Email already registered');
        }

        // Create user
        const user = await this.usersService.create(userData);

        // Return login response
        return this.login(user);
    }

    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async googleLogin(googleUser: {
        email: string;
        full_name: string;
        avatar_url: string;
        googleId: string;
    }) {
        // Check if user exists
        let user = await this.usersService.findByEmail(googleUser.email);

        if (!user) {
            // Create new user from Google profile
            user = await this.usersService.create({
                email: googleUser.email,
                full_name: googleUser.full_name,
                avatar_url: googleUser.avatar_url,
                password: null, // No password for OAuth users
            });
        }

        return this.login(user);
    }
}
