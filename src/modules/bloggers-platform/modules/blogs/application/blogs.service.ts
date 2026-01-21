import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async deleteBlog(id: string) {
    await this.blogsRepository.findOrNotFoundFail(id);

    await this.blogsRepository.deleteBlog(id);
  }
}
