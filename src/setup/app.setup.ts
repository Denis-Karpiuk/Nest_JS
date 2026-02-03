import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';

export function appSetup(app: INestApplication) {
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  if (typeof instance.set === 'function') {
    instance.set('trust proxy', 1);
  }
  app.use(cookieParser());
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);
  app.enableCors({
    credentials: true,
    origin: true,
  });
}
