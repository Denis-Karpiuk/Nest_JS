import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../constants/auth-tokens.inject-constants';

export const jwtAccessModule = {
  provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  useFactory: (configService: ConfigService): JwtService => {
    return new JwtService({
      secret: configService.get('ACCESS_TOKEN_SECRET'),
      signOptions: { expiresIn: configService.get('ACCESS_JWT_EXPIRES_IN') },
    });
  },
  inject: [ConfigService],
};

export const jwtRefreshModule = {
  provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
  useFactory: (configService: ConfigService): JwtService => {
    return new JwtService({
      secret: configService.get('REFRESH_TOKEN_SECRET'),
      signOptions: { expiresIn: configService.get('REFRESH_JWT_EXPIRES_IN') },
    });
  },
  inject: [ConfigService],
};
