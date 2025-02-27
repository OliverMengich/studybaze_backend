/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY, RolesEnum } from './roles.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector){}
    canActivate(context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(ROLES_KEY,[
            context.getHandler(),
            context.getClass()
        ])
        if (!requiredRoles) return true
        const ctx = GqlExecutionContext.create(context)
        const user = ctx.getContext().req.user;
        const hasRequiredRoles = requiredRoles.some(role=> user.role = role) // if required roles contains a role from specified roles.
        return hasRequiredRoles
    }
}
