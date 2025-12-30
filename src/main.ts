import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSetup(app);

  await app.listen(process.env.PORT ?? 5002, () => {
    console.log(
      `Server started on port ${process.env.PORT ?? 5002} , env: ${process.env.NODE_ENV}`,
    );
  });
}
bootstrap();
