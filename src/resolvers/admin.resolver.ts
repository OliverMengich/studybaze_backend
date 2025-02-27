/* eslint-disable prettier/prettier */
import { HttpException, UseGuards, } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Admin } from 'src/models/admin.model';
import { AuthPayload } from 'src/models/auth.payload';
import { PrismaService } from 'src/prisma.service';
import { compareFunc, hashingFunc } from 'src/utils';
import { CreateAdminDto } from './dto/admin/createadmin.dto';
import { GQLAuthGuard } from 'src/auth/auth.guard';

@Resolver()
export class AdminResolver {
    constructor(private jwtService: JwtService,  private prismaService: PrismaService, ) {}

    @UseGuards(GQLAuthGuard)
    @Query(()=>Admin)
    async getAdmin(@Args('id') id: string){
        const admin = await this.prismaService.admin.findUnique({
            where:{id},
            select:{
                email: true,
                id: true,
                name: true,
                profile_image: true
            }
        })
        return admin
    }

    @Mutation(()=>AuthPayload,{nullable: true})
    async registerAdmin(@Args('createAdminDto') createAdminDto: CreateAdminDto){
        try {
            let hashedPassword = ''
            if (createAdminDto.password) {
                hashedPassword = await hashingFunc(createAdminDto.password);
            } else {
                hashedPassword = '';
            }
            const new_admin = await this.prismaService.user.create({
                data:{...createAdminDto, password: hashedPassword}
            });
            return{
                id: new_admin.id,
                access_token: await this.jwtService.signAsync({id: new_admin.id,role:'ADMIN', email: new_admin.email},{secret:process.env.SUPER_ADMIN_KEY}),
                refresh_token: await this.jwtService.signAsync({id: new_admin.id,role: 'ADMIN'},{secret:process.env.SUPER_ADMIN_KEY}),
            }
        } catch (error) {
            throw new HttpException(error.message,404)
        }
    }

    @Mutation(()=>AuthPayload,{nullable: true,})
    async loginAdmin(@Args('email') email:string, @Args('password') password: string): Promise<AuthPayload>{
        try {
            const admin = await this.prismaService.admin.findUnique({where:{email}})
            if(!admin){
                throw new HttpException('Not found',404)
            }
            const isMatch = await compareFunc(admin.password,password)
            if(!isMatch) 
                throw new HttpException('Not found',404)
            return{
                id: admin.id,
                access_token: await this.jwtService.signAsync({id: admin.name,role:'admin',email: admin.email}),
                refresh_token: await this.jwtService.signAsync({id: admin.id,role:'admin',}),
                email: admin.email,
                name: admin.name,
                picture: admin.profile_image
            } 
        } catch (error) {
            throw error;
        }
    }
    @Mutation(()=>AuthPayload,{nullable: true,})
    async refreshTokenAdmin(@Args('refresh_token') refresh_token:string ): Promise<AuthPayload>{
        try {
            const decoded = await this.jwtService.verifyAsync(refresh_token)
            if (!decoded) {
                throw new HttpException('Not found',404)
            }
            const admin = await this.prismaService.admin.findUnique({where:{id: decoded.id}})
            if(!admin){
                throw new HttpException('Not found',404)
            }
            return{
                id: admin.id,
                access_token: await this.jwtService.signAsync({id: admin.name,role:'admin',email: admin.email}),
                refresh_token: await this.jwtService.signAsync({id: admin.id,role:'admin',}),
                email: admin.email,
                name: admin.name,
                picture: admin.profile_image
            } 
        } catch (error) {
            throw error;
        }
    }
}
