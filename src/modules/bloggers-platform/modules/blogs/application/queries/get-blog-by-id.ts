import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';

export class GetBlogByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async execute(query: GetBlogByIdQuery) {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
