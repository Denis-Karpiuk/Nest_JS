import { Module } from '@nestjs/common';
import { BlogsSharedModule } from '../blogs/blogs-shared.module';
import { PostsController } from './api/posts.controller';
import { PostsExternalService } from './application/posts.external-service';
import { GetPostByIdQueryHandler } from './application/queries/get-post-by-id.queries-handler';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { DeletePostUseCase } from './application/usecases/delete-post.usecase';
import { UpdatePostUseCase } from './application/usecases/update-post.usecase';
import { Post } from './domain/post.entity';
import { PostsExternalQueryRepository } from './infrastructure/external-query/posts.external-query-repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { GetPostsQueryHandler } from './application/queries/get-posts.queries-handler';
import { CreatePostCommentUseCase } from './application/usecases/create-post-comment.usecase';
import { CommentsModule } from '../comments/comments.module';
import { PostsSharedModule } from './posts-shared.module';
import { LikesModule } from '../likes/likes.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const commandHandlers = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreatePostCommentUseCase,
];

const queryHandlers = [GetPostByIdQueryHandler, GetPostsQueryHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    BlogsSharedModule,
    CommentsModule,
    PostsSharedModule,
    LikesModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsQueryRepository,
    PostsExternalService,
    PostsExternalQueryRepository,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [PostsExternalService, PostsExternalQueryRepository],
})
export class PostsModule {}
