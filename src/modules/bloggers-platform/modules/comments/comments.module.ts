import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsModule } from 'src/modules/users-accounts/users-accounts.module';
import { Comment } from './domain/comment.entity';
import { CommentsController } from './api/comments.controller';
import { CommentsQueryRepository } from './infrastructure/comments.query-repository';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentsExternalQueryRepository } from './infrastructure/external-query/comments.exteranl-query-repository';
import { CommentsExternalService } from './application/external/comments.external-service';
import { GetCommentByIdQueryHandler } from './application/queries/get-comment-by-id.query-handler';
import { CommentsSharedModule } from './comments-shared.module';
import { DeleteCommentUseCase } from './application/usecases/delete-comment.usecases';
import { UpdateCommentUseCase } from './application/usecases/update-comment.usecase';
import { LikesModule } from '../likes/likes.module';

const queryHandlers = [GetCommentByIdQueryHandler];
const commandHandlers = [DeleteCommentUseCase, UpdateCommentUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    CommentsSharedModule,
    LikesModule,
    UserAccountsModule,
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
