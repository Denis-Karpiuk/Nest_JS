import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './domain/like.entity';
import { LikesRepository } from './infrastructure/likes.repository';
import { AddPostLikeUseCase } from './application/usecases/add-post-like-status.usecase';
import { AddCommentLikeUseCase } from './application/usecases/add-comment-like-status.usecase';
import { GetLikesByPostIdQueryHandler } from './application/queries/get-likes-by-postId.query-handler';
import { LikesPostsQueryRepository } from './infrastructure/likes.posts.query-repository';
import { UserAccountsModule } from 'src/modules/users-accounts/users-accounts.module';
import { LikesCommentsQueryRepository } from './infrastructure/likes.comments.query-repository';

const queryHandlers = [GetLikesByPostIdQueryHandler];
const commandHandlers = [AddPostLikeUseCase, AddCommentLikeUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    UserAccountsModule,
  ],
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
