import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../domain/blog.entity';
import { UpdateBlogDto } from '../dto/create-blog.dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private blogsRepository: BlogsRepository,
  ) {}

  async updateBlog(id: string, dto: UpdateBlogDto) {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    blog.update(dto);

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async deleteBlog(id: string) {
    await this.blogsRepository.findOrNotFoundFail(id);

    await this.blogsRepository.deleteBlog(id);
  }
}
