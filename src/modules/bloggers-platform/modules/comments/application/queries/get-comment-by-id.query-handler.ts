import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';

export class GetCommentByIdQuery {
  constructor(public id: Types.ObjectId) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(query: GetCommentByIdQuery) {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
