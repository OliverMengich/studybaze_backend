/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload } from 'src/models/auth.payload';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy,'admin-jwt') {
    constructor(private jwtService: JwtService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.USER_KEY
        });
    }

    async validate(payload: AuthPayload) {
        const {access_token} = payload;
        const decoded = await this.jwtService.verifyAsync(access_token,{
            secret: process.env.USER_KEY
        });
        if (!decoded || !decoded.id)
            throw new HttpException('Not found',402)
        return {admin: decoded}
    }
}
