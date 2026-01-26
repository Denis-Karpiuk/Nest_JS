import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './domain/comment.entity';
import { CommentsController } from './api/comments.controller';
import { CommentsQueryRepository } from './infrastructure/comments.query-repository';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentsExternalQueryRepository } from './infrastructure/external-query/comments.exteranl-query-repository';
import { CommentsExternalService } from './application/external/comments.external-service';
import { GetCommentByIdQueryHandler } from './application/queries/get-comment-by-id.query-handler';
import { CommentsSharedModule } from './comments-shared.module';
import { DeleteCommentUseCase } from './application/usecases/delete-comment.usecases';

const queryHandlers = [GetCommentByIdQueryHandler];
const commandHandlers = [DeleteCommentUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    CommentsSharedModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsRepository,
    CommentsQueryRepository,
    CommentsExternalService,
    CommentsExternalQueryRepository,
    ...queryHandlers,
    ...commandHandlers,
  ],
  exports: [CommentsExternalQueryRepository, CommentsExternalService],
})
export class CommentsModule {}
