import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const result = super.canActivate(context);

    // Если это Promise, обрабатываем ошибки
    if (result instanceof Promise) {
      return result.catch(() => {
        return true;
      });
    }

    return result;
  }

  handleRequest(err: any, user: any): any {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
