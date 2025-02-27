/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
    constructor(configService: ConfigService, private prismaService: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET'),
            ignoreExpiration: false
        });
    }

    async validate(payload: any) {
        const {id, email,role} = payload;
        
        if (!id)
            throw new HttpException('Not found',402)
        if (role) {
            const admin = await this.prismaService.admin.findUnique({where:{id}})
            if (!admin) {
                throw new HttpException('Not found',402)
            }
            return {
                user:{
                    id, 
                    email, 
                    role
                }
            }
        }
        return {
            user: {
                id, 
                email, 
                role: 'USER'
            }
        }
    }
}
