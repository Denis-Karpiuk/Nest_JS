import { CommentDocument } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  postId: string;
  commentatorInfo: { userId: string; userLogin: string };
  createdAt: Date;

  static mapToView(dto: CommentDocument): CommentViewDto {
    const viewDto = new CommentViewDto();

    viewDto.id = dto._id.toString();

    viewDto.content = dto.content;
    viewDto.postId = dto.postId;
    viewDto.commentatorInfo = {
      userId: dto.commentatorInfo.userId,
      userLogin: dto.commentatorInfo.userLogin,
    };
    viewDto.createdAt = dto.createdAt;

    return viewDto;
  }
}
