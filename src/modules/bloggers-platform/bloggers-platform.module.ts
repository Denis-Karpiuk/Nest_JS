import { Module } from '@nestjs/common';
import { BlogsModule } from './modules/blogs/blogs.module';
import { PostsModule } from './modules/posts/posts.module';

//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [BlogsModule, PostsModule],
  providers: [],
})
export class BloggersPlatformModule {}
