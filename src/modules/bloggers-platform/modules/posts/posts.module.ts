import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './domain/post.entity';
import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { PostsExternalService } from './application/posts.external-service';
import { PostsExternalQueryRepository } from './infrastructure/external-query/posts.external-query-repository';
import { BlogsSharedModule } from '../blogs/blogs-shared.module';

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
  ],
  exports: [PostsExternalService, PostsExternalQueryRepository],
})
export class PostsModule {}
