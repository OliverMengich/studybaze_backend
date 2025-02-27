/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { UserResolver } from './resolvers/user.resolver';
import { DocumentResolver } from './resolvers/document.resolver';
import { JwtModule } from '@nestjs/jwt';
import { AdminResolver } from './resolvers/admin.resolver';
import { JwtStrategy } from './auth/jwt.strategy';
@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
            sortSchema: true,
        }),
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            isGlobal: true,
        }),
        JwtModule.registerAsync({
            imports:[ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService)=> ({
                secret: configService.get<'string'>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN')
                }
            }),
            global: true,
        }),
    ],
    controllers: [AppController],
    providers: [AppService, UserResolver, DocumentResolver, AdminResolver, JwtStrategy, PrismaService],
})
export class AppModule {}
