import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './domain/post.entity';
import { PostsRepository } from './infrastructure/posts.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  providers: [PostsRepository],
  exports: [PostsRepository],
})
export class PostsSharedModule {}
