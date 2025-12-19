import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from './blogs.query-repository';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async getBlogNameByBlogId(id: string): Promise<string> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(id);

    return blog.name;
  }
}
