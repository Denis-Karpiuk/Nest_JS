import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './domain/comment.entity';
import { CommentsRepository } from './infrastructure/comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentsRepository],
  exports: [CommentsRepository],
})
export class CommentsSharedModule {}
