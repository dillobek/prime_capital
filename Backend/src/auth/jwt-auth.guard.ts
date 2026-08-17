import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './roles.decorator';

export type AuthedUser = { sub: string; role: string; email: string };
// Minimal shape we rely on — avoids depending on @types/express, which isn't a project dependency.
export type AuthedRequest = { headers: Record<string, string | undefined>; user?: AuthedUser };

/**
 * Verifies the `Authorization: Bearer <token>` header on every route it guards.
 * If the route (or its controller) carries @Roles(...), the token's role must match.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const header = request.headers['authorization'];
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Avtorizatsiya talab qilinadi');

    try {
      request.user = this.jwt.verify<AuthedUser>(token);
    } catch {
      throw new UnauthorizedException('Token yaroqsiz yoki muddati o‘tgan');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles?.length && !requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Bu amal uchun ruxsatingiz yo‘q');
    }
    return true;
  }
}
