import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EntityType } from '../domain/dto/entity-type.enum';
import { LikeStatusEnum } from '../domain/dto/like-status-enum';
import { Like, LikeDocument, type LikeModelType } from '../domain/like.entity';

@Injectable()
export class LikesCommentsQueryRepository {
  constructor(
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
  ) {}

  async getCommentsLikesInfo(commentId: string, userId?: string) {
    const likesCount = await this.getCommentsLikesCount(commentId);
    const dislikesCount = await this.getCommentsDislikesCount(commentId);

    const result = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: LikeStatusEnum.None,
    };

    if (userId) {
      const userLikeStatus = await this.findCommentLikeByCommentIdAndUserId(
        commentId,
        userId,
      );

      if (userLikeStatus) {
        result.myStatus = userLikeStatus.likeStatus;
      }
    }

    return result;
  }

  private async getCommentsLikesCount(commentId: string) {
    return await this.LikeModel.countDocuments({
      entityId: commentId,
      entityType: EntityType.Comment,
      likeStatus: LikeStatusEnum.Like,
    }).lean();
  }

  private async getCommentsDislikesCount(commentId: string) {
    return await this.LikeModel.countDocuments({
      entityId: commentId,
      entityType: EntityType.Comment,
      likeStatus: LikeStatusEnum.Dislike,
    }).lean();
  }

  private async findCommentLikeByCommentIdAndUserId(
    commentId: string,
    userId: string,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({
      entityId: commentId,
      entityType: EntityType.Comment,
      userId,
    });
  }
}
