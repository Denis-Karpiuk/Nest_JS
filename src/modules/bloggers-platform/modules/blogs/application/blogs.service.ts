import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Blog, type BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto) {
    const blog = this.BlogModel.createInstance(dto);

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlog(id: string, dto: CreateBlogDto) {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    blog.update(dto);

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async deleteBlog(id: string) {
    await this.blogsRepository.deleteBlog(id);
  }
}
