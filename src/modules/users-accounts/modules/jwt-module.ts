import { JwtModule } from '@nestjs/jwt';

export const jwtModule = JwtModule.register({
  //TODO: move to env. will be in the following lessons
  secret: 'access-token-secret',
  // Время жизни токена
  signOptions: { expiresIn: '60m' },
});
