import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../domain/comment.entity';
import { Types } from 'mongoose';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getByIdOrNotFoundFail(id: Types.ObjectId): Promise<CommentDocument> {
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

    return comment;
  }
}
