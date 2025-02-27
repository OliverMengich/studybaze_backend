/* eslint-disable prettier/prettier */
import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminGqlAuthGuard extends AuthGuard('admin-jwt') {
    constructor(private prismaService: PrismaService) {
        super();
    }
    async getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const rq = ctx.getContext().req;
        const admin = await this.prismaService.admin.findUnique({where:{id: rq.admin.id}})
        if (!admin) {
            throw new HttpException('Not found',402)
        }
        return rq; // Extract request from GraphQL context
    }
}
