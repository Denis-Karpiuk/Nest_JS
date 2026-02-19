import { Injectable } from '@nestjs/common';
import { Like } from '../domain/like.entity';
import { EntityType } from '../domain/dto/entity-type.enum';
import { LikeStatusEnum } from '../domain/dto/like-status-enum';
import { UsersExternalQueryRepository } from 'src/modules/users-accounts/infrastructure/external-query/users.external-query-repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LikesPostsQueryRepository {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
    private readonly usersExternalQueryRepository: UsersExternalQueryRepository,
  ) {}

  async getPostsLikesInfo(postId: string, userId?: string) {
    const newestLikes = await this.likesRepository.find({
      where: {
        entityId: postId,
        entityType: EntityType.Post,
        likeStatus: LikeStatusEnum.Like,
      },
      take: 3,
      skip: 0,
    });

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
      likesCount: await this.likesRepository.count({
        where: {
          entityId: postId,
          entityType: EntityType.Post,
          likeStatus: LikeStatusEnum.Like,
        },
      }),
      dislikesCount: await this.likesRepository.count({
        where: {
          entityId: postId,
          entityType: EntityType.Post,
          likeStatus: LikeStatusEnum.Dislike,
        },
      }),
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
    return await this.likesRepository.count({
      where: {
        entityId: postId,
        entityType: EntityType.Post,
        likeStatus: LikeStatusEnum.Like,
      },
    });
  }

  private async getPostDislikesCount(postId: string) {
    return await this.likesRepository.count({
      where: {
        entityId: postId,
        entityType: EntityType.Post,
        likeStatus: LikeStatusEnum.Dislike,
      },
    });
  }

  private async getNewestPostLikesByPostId(
    postId: string,
    size = 3,
  ): Promise<Like[]> {
    return await this.likesRepository.find({
      where: {
        entityId: postId,
        entityType: EntityType.Post,
        likeStatus: LikeStatusEnum.Like,
      },
      take: size,
      skip: 0,
      order: { createdAt: -1 },
    });
  }

  private async findPostLikeByPostIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<Like | null> {
    return this.likesRepository.findOne({
      where: { entityId: postId, entityType: EntityType.Post, userId },
    });
  }
}
