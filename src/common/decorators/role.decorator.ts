import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Admin = 'admin';
export const User = 'user';
export const Role = (args: string) => SetMetadata(ROLES_KEY, args);
