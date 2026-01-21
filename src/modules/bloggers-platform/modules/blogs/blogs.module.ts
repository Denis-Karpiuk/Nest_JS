import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blog.entity';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { PostsModule } from '../posts/posts.module';
import { CreateBlogUseCase } from './application/usecases/create-blog.usecase';
import { GetBlogByIdQueryHandler } from './application/queries/get-blog-by-id';

const commandHandlers = [CreateBlogUseCase];

const queryHandlers = [GetBlogByIdQueryHandler];
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [],
})
export class BlogsModule {}
