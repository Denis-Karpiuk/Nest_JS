import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsSharedModule } from '../blogs/blogs-shared.module';
import { PostsController } from './api/posts.controller';
import { PostsExternalService } from './application/posts.external-service';
import { PostsService } from './application/posts.service';
import { GetBlogByIdQueryHandler } from './application/queries/get-post-by-id';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { Post, PostSchema } from './domain/post.entity';
import { PostsExternalQueryRepository } from './infrastructure/external-query/posts.external-query-repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { PostsRepository } from './infrastructure/posts.repository';

const commandHandlers = [CreatePostUseCase];

const queryHandlers = [GetBlogByIdQueryHandler];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    BlogsSharedModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    PostsExternalService,
    PostsExternalQueryRepository,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [PostsExternalService, PostsExternalQueryRepository],
})
export class PostsModule {}
