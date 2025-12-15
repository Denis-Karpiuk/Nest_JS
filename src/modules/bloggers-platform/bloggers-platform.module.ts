import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { UserAccountsModule } from '../users-accounts/users-accounts.module';

//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [UserAccountsModule],
  providers: [BlogsService],
})
export class BloggersPlatformModule {}
