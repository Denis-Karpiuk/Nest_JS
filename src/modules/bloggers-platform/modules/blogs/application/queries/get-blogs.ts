import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBlogsQueryParamsDto } from '../../api/input-dto/get-blogs-query-params.input.dto';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';

export class GetBlogBlogsQuery {
  constructor(
    public params: GetBlogsQueryParamsDto,
    public userId?: string,
  ) {}
}

@QueryHandler(GetBlogBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<GetBlogBlogsQuery> {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async execute(query: GetBlogBlogsQuery) {
    return this.blogsQueryRepository.getAllBlogs(query.params);
  }
}
