import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UserContextDto } from '../dto/user-context.dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractRefreshTokenFromCookies,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET') || 'secret',
    });
  }

  async validate(payload: {
    id: string;
    login: string;
  }): Promise<UserContextDto> {
    return { id: payload.id, login: payload.login };
  }
}

function extractRefreshTokenFromCookies(req: Request): string | null {
  if (!req?.cookies) return null;
  const token: unknown = req.cookies.refreshToken;
  return typeof token === 'string' ? token : null;
}
