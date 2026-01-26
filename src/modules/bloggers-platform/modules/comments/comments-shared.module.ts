import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './domain/comment.entity';
import { CommentsRepository } from './infrastructure/comments.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  providers: [CommentsRepository],
  exports: [CommentsRepository],
})
export class CommentsSharedModule {}
