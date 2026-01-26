import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { GetCommentsQueryParamsDto } from '../../api/input-dto/get-comments-query-params.input.dto';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { LikesCommentsQueryRepository } from '../../../likes/infrastructure/likes.comments.query-repository';

@Injectable()
export class CommentsExternalQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private readonly likesCommentsQueryRepository: LikesCommentsQueryRepository,
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

  async getAllCommentsByPostId(
    postId: Types.ObjectId,
    query: GetCommentsQueryParamsDto,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const postIdStr = postId.toString();

    const comments = await this.CommentModel.find({ postId: postIdStr })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const items = await Promise.all(
      comments.map(async (comment) => {
        const likesInfo =
          await this.likesCommentsQueryRepository.getCommentsLikesInfo(
            comment._id.toString(),
            userId,
          );
        return CommentViewDto.mapToView(comment, likesInfo);
      }),
    );

    const totalCount = await this.CommentModel.countDocuments({
      postId: postIdStr,
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
