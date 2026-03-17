import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const postgresModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    const base = {
      type: 'postgres' as const,
      schema: 'public',
      synchronize: configService.get('NODE_ENV') === 'development',
      logging: false,
      autoLoadEntities: true,
    };
    if (databaseUrl) {
      return { ...base, url: databaseUrl };
    }
    return {
      ...base,
      host: String(configService.get('POSTGRES_HOST') ?? 'localhost'),
      port: Number(configService.get('POSTGRES_PORT') ?? 5432),
      username: String(configService.get('POSTGRES_USER') ?? 'postgres'),
      password: String(configService.get('POSTGRES_PASSWORD') ?? 'postgres'),
      database: String(configService.get('POSTGRES_DB') ?? 'app_dev'),
    };
  },
});
