import { CommentDocument } from '../../domain/comment.entity';
import { LikeStatusEnum } from '../../../likes/domain/dto/like-status-enum';

class LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
}

class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class CommentViewDto {
  id: string;
  content: string;
  postId: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;

  likesInfo: LikesInfo;

  static mapToView(
    dto: CommentDocument,
    likesInfo?: LikesInfo,
  ): CommentViewDto {
    const viewDto = new CommentViewDto();

    viewDto.id = dto._id.toString();

    viewDto.content = dto.content;
    viewDto.commentatorInfo = {
      userId: dto.commentatorInfo.userId,
      userLogin: dto.commentatorInfo.userLogin,
    };
    viewDto.createdAt = dto.createdAt;

    viewDto.likesInfo = likesInfo || {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatusEnum.None,
    };

    return viewDto;
  }
}
