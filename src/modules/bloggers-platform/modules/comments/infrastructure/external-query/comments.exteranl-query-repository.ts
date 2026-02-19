import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { GetCommentsQueryParamsDto } from '../../api/input-dto/get-comments-query-params.input.dto';
import { Comment } from '../../domain/comment.entity';
import { LikesCommentsQueryRepository } from '../../../likes/infrastructure/likes.comments.query-repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsExternalQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly likesCommentsQueryRepository: LikesCommentsQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const comment = await this.commentsRepository.findOne({ where: { id } });

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
    postId: string,
    query: GetCommentsQueryParamsDto,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const comments = await this.commentsRepository.find({
      where: { postId },
    });

    const items = await Promise.all(
      comments.map(async (comment) => {
        const likesInfo =
          await this.likesCommentsQueryRepository.getCommentsLikesInfo(
            comment.id,
            userId,
          );
        return CommentViewDto.mapToView(comment, likesInfo);
      }),
    );

    const totalCount = await this.commentsRepository.count({
      where: { postId },
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
