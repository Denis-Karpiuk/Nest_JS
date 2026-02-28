import { Injectable } from '@nestjs/common';
import { Like } from '../domain/like.entity';
import { LikeStatusEnum } from '../domain/dto/like-status-enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LikesPostsQueryRepository {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
  ) {}

  async getPostsLikesInfo(postId: string, userId?: string) {
    const newestLikes = await this.likesRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.user', 'user')
      .where('l.post.id = :postId', { postId })
      .andWhere('l.likeStatus = :likeStatus', {
        likeStatus: LikeStatusEnum.Like,
      })
      .orderBy('l.createdAt', 'DESC')
      .take(3)
      .skip(0)
      .getMany();

    const newestLikesWithUserInfo = newestLikes
      .filter((like): like is Like & { user: NonNullable<Like['user']> } =>
        Boolean(like.user?.id),
      )
      .map((like) => ({
        addedAt: like.createdAt,
        userId: like.user.id,
        login: like.user.login ?? 'unknown',
      }));

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
