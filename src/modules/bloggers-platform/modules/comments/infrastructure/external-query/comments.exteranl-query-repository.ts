import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { Types } from 'mongoose';

@Injectable()
export class CommentsExternalQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getByIdOrNotFoundFail(id: Types.ObjectId): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        extensions: [
          {
            field: 'commentId',
            message: 'Comment not found',
          },
        ],
      });
    }

    return CommentViewDto.mapToView(comment);
  }
}
