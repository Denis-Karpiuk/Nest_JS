import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Blog, BlogDocument, type BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(id: Types.ObjectId): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: id,
    });
  }

  async findOrNotFoundFail(id: Types.ObjectId): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        extensions: [
          {
            field: 'blogId',
            message: 'Blog not found',
          },
        ],
      });
    }

    return blog;
  }

  async deleteBlog(id: Types.ObjectId) {
    return this.BlogModel.deleteOne({
      _id: id,
    });
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}
