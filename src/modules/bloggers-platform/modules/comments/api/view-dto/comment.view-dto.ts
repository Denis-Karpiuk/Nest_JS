import { CommentDocument } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;

  static mapToView(dto: CommentDocument): CommentViewDto {
    const viewDto = new CommentViewDto();

    viewDto.id = dto._id.toString();

    return viewDto;
  }
}
