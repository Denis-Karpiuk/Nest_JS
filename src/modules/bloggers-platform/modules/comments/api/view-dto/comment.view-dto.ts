import { Comment } from '../../domain/comment.entity';
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
    dto: Comment,
    likesInfo?: LikesInfo,
    commentatorInfo?: CommentatorInfo,
  ): CommentViewDto {
    const viewDto = new CommentViewDto();

    viewDto.id = dto.id;
    viewDto.content = dto.content;
    viewDto.postId = dto.post?.id ?? '';
    viewDto.commentatorInfo = commentatorInfo ?? {
      userId: '',
      userLogin: '',
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
