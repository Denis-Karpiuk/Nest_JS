import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findById(id: Types.ObjectId): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({
      _id: id,
    });
  }

  async findOrNotFoundFail(id: Types.ObjectId): Promise<CommentDocument> {
    const comment = await this.findById(id);

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

  async deleteComment(
    id: Types.ObjectId,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    return this.CommentModel.deleteOne({
      _id: id,
    });
  }

  async save(comment: CommentDocument) {
    await comment.save();
  }
}
