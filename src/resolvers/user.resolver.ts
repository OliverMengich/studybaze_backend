/* eslint-disable prettier/prettier */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/models/user.model';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, UseGuards } from '@nestjs/common';
import { compareFunc, hashingFunc } from 'src/utils';
import { CreateUserDto } from 'src/resolvers/dto/user/createuser.dto';
import { AuthPayload } from 'src/models/auth.payload';
import { GQLAuthGuard } from 'src/auth/auth.guard';
import { GQLContext } from 'src/auth/gql.context';
import { Roles, RolesEnum } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Resolver()
export class UserResolver{
    constructor(private jwtService: JwtService,  private prismaService: PrismaService, ) {}
    
    @Roles(RolesEnum.ADMIN)
    @UseGuards(RolesGuard)
    @UseGuards(GQLAuthGuard)
    @Query(() => [User],{nullable: true})
    async getAllUsers(){
        return await this.prismaService.user.findMany({
            select:{
                bought_documents: true,
                email: true,
                id: true,
                name: true,
                profile_image: true
            }
        })
    }

    @Mutation(()=>AuthPayload,{nullable: true})
    async registerUser(@Args('createUserDto') createUserDto: CreateUserDto){
        try {
            let hashedPassword = ''
            if (createUserDto.password) {
                hashedPassword = await hashingFunc(createUserDto.password);
            } else {
                hashedPassword = '';
            }
            const new_user = await this.prismaService.user.create({
                data:{...createUserDto, password: hashedPassword}
            });
            return{
                id: new_user.id,
                access_token: await this.jwtService.signAsync({id: new_user.id,email: new_user.email}),
                refresh_token: await this.jwtService.signAsync({id: new_user.id},{expiresIn:'30d'}),
                email: new_user.email,
                name: new_user.password,
                picture: new_user.profile_image
            }
        } catch (error) {
            throw new HttpException(error.message,404)
        }
    }

    @UseGuards(GQLAuthGuard)
    @Query(() => User,{nullable: true})
    async getUser(@GQLContext() userInfo:{id: string}){
        console.log(userInfo)
        return await this.prismaService.user.findUnique({where:{id: userInfo.id}});
    }
    
    @UseGuards(GQLAuthGuard)
    @Query(() => User,{nullable: true})
    async getUserByIdByAdmin(@Args('id') id:string,){
        return await this.prismaService.user.findUnique({where:{id}});
    }
    
    @Mutation(()=>AuthPayload,{nullable: true,})
    async loginUser(@Args('email') email:string, @Args('password') password: string): Promise<AuthPayload>{
        const user = await this.prismaService.user.findUnique({where:{email}})
        if(!user){
            throw new HttpException('user not found',404)
        }
        const isMatch = await compareFunc(user.password,password)
        if(!isMatch) 
            throw new HttpException('Not found',404)
        return{
            id: user.id,
            access_token: await this.jwtService.signAsync({id: user.name,email: user.email},{
                secret: process.env.USER_KEY,
            }),
            refresh_token: await this.jwtService.signAsync({id: user.id},{
                secret: process.env.USER_KEY,
            }),
            email: user.email,
            name: user.name,
            picture: user.profile_image
        } 
    }
    @Mutation(()=>AuthPayload,{nullable: true,})
    async refreshTokenUser(@Args('refresh_token') refresh_token:string ): Promise<AuthPayload>{
        try {
            const decoded = await this.jwtService.verifyAsync(refresh_token)
            if (!decoded) {
                throw new HttpException('Not found',404)
            }
            const user = await this.prismaService.user.findUnique({where:{id: decoded.id}})
            if(!user){
                throw new HttpException('Not found',404)
            }
            return{
                id: user.id,
                access_token: await this.jwtService.signAsync({id: user.name,role:'user',email: user.email}),
                refresh_token: await this.jwtService.signAsync({id: user.id,role:'admin',}),
                email: user.email,
                name: user.name,
                picture: user.profile_image
            } 
        } catch (error) {
            throw error;
        }
    }
}