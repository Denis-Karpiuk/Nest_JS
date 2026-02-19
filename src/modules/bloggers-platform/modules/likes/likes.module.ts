import { Module } from '@nestjs/common';
import { Like } from './domain/like.entity';
import { LikesRepository } from './infrastructure/likes.repository';
import { AddPostLikeUseCase } from './application/usecases/add-post-like-status.usecase';
import { AddCommentLikeUseCase } from './application/usecases/add-comment-like-status.usecase';
import { GetLikesByPostIdQueryHandler } from './application/queries/get-likes-by-postId.query-handler';
import { LikesPostsQueryRepository } from './infrastructure/likes.posts.query-repository';
import { UserAccountsModule } from 'src/modules/users-accounts/users-accounts.module';
import { LikesCommentsQueryRepository } from './infrastructure/likes.comments.query-repository';
import { TypeOrmModule } from '@nestjs/typeorm';

const queryHandlers = [GetLikesByPostIdQueryHandler];
const commandHandlers = [AddPostLikeUseCase, AddCommentLikeUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([Like]), UserAccountsModule],
  providers: [
    LikesRepository,
    LikesPostsQueryRepository,
    LikesCommentsQueryRepository,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [LikesPostsQueryRepository, LikesCommentsQueryRepository],
})
export class LikesModule {}
