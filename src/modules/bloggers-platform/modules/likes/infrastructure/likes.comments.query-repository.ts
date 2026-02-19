import { Injectable } from '@nestjs/common';
import { EntityType } from '../domain/dto/entity-type.enum';
import { LikeStatusEnum } from '../domain/dto/like-status-enum';
import { Like } from '../domain/like.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LikesCommentsQueryRepository {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
  ) {}

  async getCommentsLikesInfo(commentId: string, userId?: string) {
    const likesCount = await this.likesRepository.count({
      where: {
        entityId: commentId,
        entityType: EntityType.Comment,
        likeStatus: LikeStatusEnum.Like,
      },
    });

    const dislikesCount = await this.likesRepository.count({
      where: {
        entityId: commentId,
        entityType: EntityType.Comment,
        likeStatus: LikeStatusEnum.Dislike,
      },
    });

    const result = {
      likesCount,
      dislikesCount,
      myStatus: LikeStatusEnum.None,
    };

    if (userId) {
      const userLikeStatus = await this.likesRepository.findOne({
        where: { entityId: commentId, entityType: EntityType.Comment, userId },
      });

      if (userLikeStatus) {
        result.myStatus = userLikeStatus.likeStatus;
      }
    }

    return result;
  }

  private async getCommentsLikesCount(commentId: string) {
    return await this.likesRepository.count({
      where: {
        entityId: commentId,
        entityType: EntityType.Comment,
        likeStatus: LikeStatusEnum.Like,
      },
    });
  }

  private async getCommentsDislikesCount(commentId: string) {
    return await this.likesRepository.count({
      where: {
        entityId: commentId,
        entityType: EntityType.Comment,
        likeStatus: LikeStatusEnum.Dislike,
      },
    });
  }

  private async findCommentLikeByCommentIdAndUserId(
    commentId: string,
    userId: string,
  ): Promise<Like | null> {
    return this.likesRepository.findOne({
      where: { entityId: commentId, entityType: EntityType.Comment, userId },
    });
  }
}
