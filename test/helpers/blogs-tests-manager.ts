import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { CreateBlogInputDto } from 'src/modules/bloggers-platform/modules/blogs/api/input-dto/create-blog.input.dto';
import { BlogViewDto } from 'src/modules/bloggers-platform/modules/blogs/api/view-dto/blogs.view-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import request from 'supertest';

export class BlogsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createBlog(
    createBlogBody: CreateBlogInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer() as Server)
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .send(createBlogBody)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as BlogViewDto;
  }
}
