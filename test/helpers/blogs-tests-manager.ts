import { HttpStatus, INestApplication } from '@nestjs/common';
import { Types } from 'mongoose';
import type { Server } from 'http';
import { CreateBlogInputDto } from 'src/modules/bloggers-platform/modules/blogs/api/input-dto/create-blog.input.dto';
import { BlogViewDto } from 'src/modules/bloggers-platform/modules/blogs/api/view-dto/blogs.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import request from 'supertest';
import { CreatePostInputDto } from 'src/modules/bloggers-platform/modules/posts/api/input-dto/create-post.input.dto';
import { PostsViewDto } from 'src/modules/bloggers-platform/modules/posts/api/view-dto/posts.view-dto';
import { CreateBlogPostDto } from 'src/modules/bloggers-platform/modules/blogs/api/input-dto/creat-blog-post.dto';

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

  async updateBlog(
    dto: CreateBlogInputDto,
    blogId: Types.ObjectId,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<any> {
    await request(this.app.getHttpServer() as Server)
      .put(`/${GLOBAL_PREFIX}/blogs/${blogId.toString()}`)
      .send(dto)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async deleteBlog(
    blogId: Types.ObjectId,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer() as Server)
      .delete(`/${GLOBAL_PREFIX}/blogs/${blogId.toString()}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async getAllBlogs(
    query?: Record<string, any>,
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const response = await request(this.app.getHttpServer() as Server)
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .query(query || {})
      .expect(statusCode);

    return response.body as PaginatedViewDto<BlogViewDto[]>;
  }

  async createPost(
    blogId: Types.ObjectId,
    createPostBody: CreateBlogPostDto,
  ): Promise<PostsViewDto> {
    const response = await request(this.app.getHttpServer() as Server)
      .post(`/${GLOBAL_PREFIX}/blogs/${blogId.toString()}/posts`)
      .send(createPostBody)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.CREATED);

    return response.body as PostsViewDto;
  }
}
