import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { Like } from '../../domain/like.entity';

export class GetLikesByPostIdQuery {
  constructor(public readonly postId: string) {}
}

@QueryHandler(GetLikesByPostIdQuery)
export class GetLikesByPostIdQueryHandler implements IQueryHandler<GetLikesByPostIdQuery> {
  constructor(private readonly likesRepository: LikesRepository) {}

  async execute(query: GetLikesByPostIdQuery): Promise<Like[]> {
    return this.likesRepository.findAllPostsLikes(query.postId);
  }
}
