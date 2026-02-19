import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
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
  ) {}

  async execute(query: GetCommentByIdQuery) {
    const comment = await this.commentsQueryRepository.getByIdOrNotFoundFail(
      query.id,
    );

    const likesInfo =
      await this.likesCommentsQueryRepository.getCommentsLikesInfo(
        comment.id,
        query.userId,
      );

    return CommentViewDto.mapToView(comment, likesInfo);
  }
}
