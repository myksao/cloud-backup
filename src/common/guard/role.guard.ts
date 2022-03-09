import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  private logger: Logger;
  constructor(private reflector: Reflector) {
    this.logger = new Logger(RoleGuard.name);
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<string>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    this.logger.debug(requiredRole);
    const { user } = context.switchToHttp().getRequest();
    this.logger.debug(user.role);
    if (user.role !== requiredRole) throw new UnauthorizedException();
    return true;
  }
}
