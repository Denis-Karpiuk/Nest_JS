import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersExternalQueryRepository } from 'src/modules/users-accounts/infrastructure/external-query/users.external-query-repository';
import { LikesCommentsQueryRepository } from '../../../likes/infrastructure/likes.comments.query-repository';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';

export class GetCommentByIdQuery {
  constructor(
    public id: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesCommentsQueryRepository: LikesCommentsQueryRepository,
    private readonly usersExternalQueryRepository: UsersExternalQueryRepository,
  ) {}

  async execute(query: GetCommentByIdQuery) {
    const comment = await this.commentsQueryRepository.getByIdOrNotFoundFail(
      query.id,
    );

    const [likesInfo, commentator] = await Promise.all([
      this.likesCommentsQueryRepository.getCommentsLikesInfo(
        comment.id,
        query.userId,
      ),
      this.usersExternalQueryRepository.getByIdOrNotFoundFail(
        comment.commentatorId,
      ),
    ]);

    return CommentViewDto.mapToView(comment, likesInfo, {
      userId: commentator.id,
      userLogin: commentator.login,
    });
  }
}
