/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['verbose'],
        cors: {
            methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
        },
    });
    const jwtService = app.get(JwtService);
    const prismaService = app.get(PrismaService)
    app.use('/uploads', new AuthMiddleware(jwtService, prismaService).use);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
