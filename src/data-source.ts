import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load env when running migrations (e.g. .env.development)
const envFile =
  process.env.ENV_FILE_PATH ||
  join(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`);
config({ path: envFile });

const databaseUrl = process.env.DATABASE_URL;
const schema = process.env.POSTGRES_SCHEMA || 'public';

const AppDataSource = new DataSource({
  type: 'postgres',
  schema,
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'app_dev',
      }),

  // Явный список entity-файлов для устойчивой работы CLI
  entities: [
    join(__dirname, 'modules/users-accounts/domain/user.entity.ts'),
    join(
      __dirname,
      'modules/users-accounts/domain/email-confirmation.entity.ts',
    ),
    join(
      __dirname,
      'modules/users-accounts/domain/password-recovery.entity.ts',
    ),
    join(__dirname, 'modules/users-accounts/domain/devices.entity.ts'),
    join(
      __dirname,
      'modules/bloggers-platform/modules/blogs/domain/blog.entity.ts',
    ),
    join(
      __dirname,
      'modules/bloggers-platform/modules/posts/domain/post.entity.ts',
    ),
    join(
      __dirname,
      'modules/bloggers-platform/modules/comments/domain/comment.entity.ts',
    ),
    join(
      __dirname,
      'modules/bloggers-platform/modules/likes/domain/like.entity.ts',
    ),
  ],
  migrations: [join(__dirname, 'migrations', '*.ts')],
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;
