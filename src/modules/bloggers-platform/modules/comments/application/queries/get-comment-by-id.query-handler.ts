import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { LikesCommentsQueryRepository } from '../../../likes/infrastructure/likes.comments.query-repository';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';

export class GetCommentByIdQuery {
  constructor(public id: Types.ObjectId) {}
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
        comment._id.toString(),
      );

    return CommentViewDto.mapToView(comment, likesInfo);
  }
}
