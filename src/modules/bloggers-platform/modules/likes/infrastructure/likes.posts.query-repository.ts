import { Injectable } from '@nestjs/common';
import { Like, LikeDocument, type LikeModelType } from '../domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { EntityType } from '../domain/dto/entity-type.enum';
import { LikeStatusEnum } from '../domain/dto/like-status-enum';
import { UsersExternalQueryRepository } from 'src/modules/users-accounts/infrastructure/external-query/users.external-query-repository';

@Injectable()
export class LikesPostsQueryRepository {
  constructor(
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
    private readonly usersExternalQueryRepository: UsersExternalQueryRepository,
  ) {}

  async getPostsLikesInfo(postId: string, userId?: string) {
    const newestLikes = await this.getNewestPostLikesByPostId(postId);

    const newestLikesWithUserInfo = await Promise.all(
      newestLikes.map(async (like) => {
        const user =
          await this.usersExternalQueryRepository.getByIdOrNotFoundFail(
            like.userId,
          );
        return {
          addedAt: like.createdAt,
          userId: like.userId,
          login: user?.login || 'unknown',
        };
      }),
    );

    const result = {
      likesCount: await this.getPostsLikesCount(postId),
      dislikesCount: await this.getPostDislikesCount(postId),
      myStatus: LikeStatusEnum.None,
      newestLikes: newestLikesWithUserInfo,
    };

    if (userId) {
      const userLikeStatus = await this.findPostLikeByPostIdAndUserId(
        postId,
        userId,
      );

      if (userLikeStatus) {
        result.myStatus = userLikeStatus.likeStatus;
      }
    }

    return result;
  }

  private async getPostsLikesCount(postId: string) {
    return await this.LikeModel.countDocuments({
      entityId: postId,
      entityType: EntityType.Post,
      likeStatus: LikeStatusEnum.Like,
    }).lean();
  }

  private async getPostDislikesCount(postId: string) {
    return await this.LikeModel.countDocuments({
      entityId: postId,
      entityType: EntityType.Post,
      likeStatus: LikeStatusEnum.Dislike,
    }).lean();
  }

  private async getNewestPostLikesByPostId(
    postId: string,
    size = 3,
  ): Promise<LikeDocument[]> {
    return await this.LikeModel.find({
      entityId: postId,
      entityType: EntityType.Post,
      likeStatus: LikeStatusEnum.Like,
    })
      .skip(0)
      .limit(size)
      .sort({ createdAt: -1 })
      .lean();
  }

  private async findPostLikeByPostIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({
      entityId: postId,
      entityType: EntityType.Post,
      userId,
    });
  }
}
