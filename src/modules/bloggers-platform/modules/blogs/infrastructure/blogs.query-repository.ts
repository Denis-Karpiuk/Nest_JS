import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetBlogsQueryParamsDto } from '../api/input-dto/get-blogs-query-params.input.dto';
import { BlogViewDto } from '../api/view-dto/blogs.view-dto';
import { Blog } from '../domain/blog.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsSortBy } from '../api/input-dto/blogs-sort-by';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.blogsRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
      .getOne();

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

    return BlogViewDto.mapToView(blog);
  }

  async getAllBlogs(
    query: GetBlogsQueryParamsDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const qb = this.blogsRepository
      .createQueryBuilder('blog')
      .skip(query.calculateSkip())
      .take(query.pageSize);

    const searchNameTerm = query.searchNameTerm;
    if (searchNameTerm) {
      qb.andWhere('blog.name ILIKE :name', {
        name: `%${searchNameTerm}%`,
      });
    }

    const sortDir = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';
    if (query.sortBy === BlogsSortBy.Name) {
      qb.orderBy('blog.name COLLATE "C"', sortDir);
    } else {
      qb.orderBy(`blog.${query.sortBy}`, sortDir);
    }

    const [blogs, totalCount] = await qb.getManyAndCount();
    const items = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
