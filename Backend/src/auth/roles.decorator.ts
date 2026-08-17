import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Restricts a route to the given roles (checked against the JWT payload's `role`). Combine with @UseGuards(JwtAuthGuard). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
