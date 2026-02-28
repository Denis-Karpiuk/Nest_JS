import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from './blogs.query-repository';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async getBlogNameByBlogId(id: string): Promise<string> {
    if (!id) {
      return 'unknown';
    }
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(id);

    return blog.name;
  }
}
