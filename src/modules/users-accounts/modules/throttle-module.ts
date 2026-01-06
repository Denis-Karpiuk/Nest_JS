import { ThrottlerModule } from '@nestjs/throttler';

export const throttleModule = ThrottlerModule.forRoot({
  throttlers: [
    {
      ttl: 10000,
      limit: 5,
    },
  ],
});
