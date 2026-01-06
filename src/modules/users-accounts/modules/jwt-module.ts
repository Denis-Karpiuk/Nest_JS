import { JwtModule } from '@nestjs/jwt';

export const jwtModule = JwtModule.register({
  // TODO: move to env
  secret: 'access-token-secret',
  signOptions: { expiresIn: '60m' },
});
