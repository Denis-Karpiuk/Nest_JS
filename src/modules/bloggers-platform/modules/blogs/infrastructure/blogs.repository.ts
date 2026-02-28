import { Injectable } from '@nestjs/common';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Blog } from '../domain/blog.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async findById(id: string): Promise<Blog | null> {
    return this.blogsRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
      .getOne();
  }

  async findOrNotFoundFail(id: string): Promise<Blog> {
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

  async deleteBlog(
    id: string,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const result = await this.blogsRepository.delete({ id });
    return {
      acknowledged: true,
      deletedCount: result.affected ?? 0,
    };
  }

  async save(blog: Blog) {
    await this.blogsRepository.save(blog);
  }
}
