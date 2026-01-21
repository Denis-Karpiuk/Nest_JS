import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '../posts/posts.module';
import { BlogsController } from './api/blogs.controller';
import { GetBlogByIdQueryHandler } from './application/queries/get-blog-by-id';
import { CreateBlogUseCase } from './application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './application/usecases/update-blog.usecase';
import { Blog, BlogSchema } from './domain/blog.entity';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { DeleteBlogUseCase } from './application/usecases/delete-blog.usecase';

const commandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];

const queryHandlers = [GetBlogByIdQueryHandler];
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsRepository,
    BlogsQueryRepository,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [],
})
export class BlogsModule {}
