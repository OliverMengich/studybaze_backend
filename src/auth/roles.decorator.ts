/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export enum RolesEnum {
  USER,
  ADMIN,
}
export const Roles = (...roles:[RolesEnum, ...RolesEnum[]]) => SetMetadata(ROLES_KEY, roles);
