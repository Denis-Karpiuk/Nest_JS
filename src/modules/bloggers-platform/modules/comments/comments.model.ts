import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './domain/comment.entity';
import { CommentsController } from './api/comments.controller';
import { CommentsQueryRepository } from './infrastructure/comments.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [CommentsController],
  providers: [CommentsQueryRepository],
  exports: [],
})
export class CommentsModule {}
