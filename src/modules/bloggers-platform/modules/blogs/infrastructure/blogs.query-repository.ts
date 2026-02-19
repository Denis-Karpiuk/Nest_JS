import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetBlogsQueryParamsDto } from '../api/input-dto/get-blogs-query-params.input.dto';
import { BlogViewDto } from '../api/view-dto/blogs.view-dto';
import { Blog } from '../domain/blog.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.blogsRepository.findOne({
      where: { id },
    });

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
    const filter: FindOptionsWhere<Blog> = {};

    const searchNameTerm = query.searchNameTerm;

    if (searchNameTerm) {
      filter.name = ILike(`%${searchNameTerm}%`);
    }

    const blogs = await this.blogsRepository.find({
      where: filter,
      order: { [query.sortBy]: query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const items = blogs.map(BlogViewDto.mapToView);

    const totalCount = await this.blogsRepository.count({ where: filter });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
