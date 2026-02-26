import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { UsersExternalQueryRepository } from 'src/modules/users-accounts/infrastructure/external-query/users.external-query-repository';
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
    private readonly usersExternalQueryRepository: UsersExternalQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['post'],
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

    const commentator =
      await this.usersExternalQueryRepository.getByIdOrNotFoundFail(
        comment.commentatorId,
      );

    return CommentViewDto.mapToView(comment, undefined, {
      userId: commentator.id,
      userLogin: commentator.login,
    });
  }

  async getAllCommentsByPostId(
    postId: string,
    query: GetCommentsQueryParamsDto,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const sortOrder =
      query.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const comments = await this.commentsRepository.find({
      where: { post: { id: postId } },
      order: { createdAt: sortOrder },
      skip: query.calculateSkip(),
      take: query.pageSize,
      relations: ['post'],
    });

    const items = await Promise.all(
      comments.map(async (comment) => {
        const [likesInfo, commentator] = await Promise.all([
          this.likesCommentsQueryRepository.getCommentsLikesInfo(
            comment.id,
            userId,
          ),
          this.usersExternalQueryRepository.getByIdOrNotFoundFail(
            comment.commentatorId,
          ),
        ]);
        return CommentViewDto.mapToView(comment, likesInfo, {
          userId: commentator.id,
          userLogin: commentator.login,
        });
      }),
    );

    const totalCount = await this.commentsRepository.count({
      where: { post: { id: postId } },
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
