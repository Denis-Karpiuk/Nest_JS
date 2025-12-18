import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogInputDto } from './input-dto/create-blog.input.dto';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogViewDto } from './view-dto/blogs.view-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Post()
  async createBlog(@Body() dto: CreateBlogInputDto) {
    return this.blogsService.createBlog(dto);
  }
}
