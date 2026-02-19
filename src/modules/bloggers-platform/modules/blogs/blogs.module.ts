import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { BlogsController } from './api/blogs.controller';
import { GetBlogByIdQueryHandler } from './application/queries/get-blog-by-id';
import { CreateBlogUseCase } from './application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './application/usecases/update-blog.usecase';
import { Blog } from './domain/blog.entity';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { DeleteBlogUseCase } from './application/usecases/delete-blog.usecase';
import { GetBlogsQueryHandler } from './application/queries/get-blogs';
import { TypeOrmModule } from '@nestjs/typeorm';

const commandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];

const queryHandlers = [GetBlogByIdQueryHandler, GetBlogsQueryHandler];
@Module({
  imports: [TypeOrmModule.forFeature([Blog]), PostsModule],
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
