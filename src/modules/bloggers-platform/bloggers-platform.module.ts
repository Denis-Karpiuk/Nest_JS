import { Module } from '@nestjs/common';
import { BlogsModule } from './modules/blogs/blogs.module';

//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [BlogsModule],
  providers: [],
})
export class BloggersPlatformModule {}
