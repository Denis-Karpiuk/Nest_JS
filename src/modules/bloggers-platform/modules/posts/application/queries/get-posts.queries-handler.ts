import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQueryParamsDto } from '../../api/input-dto/get-posts-query-params.input.dto';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';

export class GetPostsQuery {
  constructor(
    public params: GetPostsQueryParamsDto,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler implements IQueryHandler<GetPostsQuery> {
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}

  async execute(query: GetPostsQuery) {
    return this.postsQueryRepository.getAllPosts(query.params, query.userId);
  }
}
