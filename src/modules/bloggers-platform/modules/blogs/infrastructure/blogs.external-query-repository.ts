import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from './blogs.query-repository';
import { Types } from 'mongoose';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async getBlogNameByBlogId(id: string): Promise<string> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(
      new Types.ObjectId(id),
    );

    return blog.name;
  }
}
