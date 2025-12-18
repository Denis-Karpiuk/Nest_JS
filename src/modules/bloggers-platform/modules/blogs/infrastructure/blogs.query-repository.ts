import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../domain/blog.entity';
import { BlogViewDto } from '../api/view-dto/blogs.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({
      _id: id,
    });

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }
}
