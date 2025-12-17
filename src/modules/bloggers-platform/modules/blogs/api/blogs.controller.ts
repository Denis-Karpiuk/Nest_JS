import { Body, Controller, Post } from '@nestjs/common';
import { BlogsService } from '../aplication/blogs.service';
import { CreateBlogInputDto } from './input-dto/create-blog.input.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  async createBlog(@Body() dto: CreateBlogInputDto) {
    return this.blogsService.createBlog(dto);
  }
}
