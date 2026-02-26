import { Injectable } from '@nestjs/common';
import { Like } from '../domain/like.entity';
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
        post: { id: postId },
        likeStatus: LikeStatusEnum.Like,
      },
      order: { createdAt: 'DESC' },
      take: 3,
      skip: 0,
      relations: ['user'],
    });

    const newestLikesWithUserInfo = await Promise.all(
      newestLikes.map(async (like) => {
        const user =
          await this.usersExternalQueryRepository.getByIdOrNotFoundFail(
            like.user?.id ?? '',
          );
        return {
          addedAt: like.createdAt,
          userId: like.user?.id ?? '',
          login: user?.login || 'unknown',
        };
      }),
    );

    const result = {
      likesCount: await this.likesRepository.count({
        where: {
          post: { id: postId },
          likeStatus: LikeStatusEnum.Like,
        },
      }),
      dislikesCount: await this.likesRepository.count({
        where: {
          post: { id: postId },
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
        post: { id: postId },
        likeStatus: LikeStatusEnum.Like,
      },
    });
  }

  private async getPostDislikesCount(postId: string) {
    return await this.likesRepository.count({
      where: {
        post: { id: postId },
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
        post: { id: postId },
        likeStatus: LikeStatusEnum.Like,
      },
      take: size,
      skip: 0,
      order: { createdAt: 'DESC' },
    });
  }

  private async findPostLikeByPostIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<Like | null> {
    return this.likesRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });
  }
}
