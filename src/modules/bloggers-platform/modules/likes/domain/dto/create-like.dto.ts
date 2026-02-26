import { LikeStatusEnum } from './like-status-enum';

export class CreateLikeDto {
  postId?: string;
  commentId?: string;
  likeStatus: LikeStatusEnum;
  userId: string;
}
