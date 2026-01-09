import { JwtModule } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';

export const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('ACCESS_TOKEN_SECRET'),
    signOptions: {
      expiresIn: configService.get('JWT_EXPIRES_IN', '60m'),
    },
  }),
  inject: [ConfigService],
});
