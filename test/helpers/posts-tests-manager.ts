import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { CreatePostInputDto } from 'src/modules/bloggers-platform/modules/posts/api/input-dto/create-post.input.dto';
import { PostsViewDto } from 'src/modules/bloggers-platform/modules/posts/api/view-dto/posts.view-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import request from 'supertest';

export class PostsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createPost(
    createPostBody: CreatePostInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostsViewDto> {
    const response = await request(this.app.getHttpServer() as Server)
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send(createPostBody)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as PostsViewDto;
  }

  // async updateBlog(
  //   dto: CreateBlogInputDto,
  //   blogId: Types.ObjectId,
  //   statusCode: number = HttpStatus.NO_CONTENT,
  // ): Promise<any> {
  //   await request(this.app.getHttpServer() as Server)
  //     .put(`/${GLOBAL_PREFIX}/blogs/${blogId.toString()}`)
  //     .send(dto)
  //     .auth('admin', 'qwerty')
  //     .expect(statusCode);
  // }

  // async deleteBlog(
  //   blogId: Types.ObjectId,
  //   statusCode: number = HttpStatus.NO_CONTENT,
  // ): Promise<void> {
  //   await request(this.app.getHttpServer() as Server)
  //     .delete(`/${GLOBAL_PREFIX}/blogs/${blogId.toString()}`)
  //     .auth('admin', 'qwerty')
  //     .expect(statusCode);
  // }

  // async getAllBlogs(
  //   query?: Record<string, any>,
  //   statusCode: number = HttpStatus.OK,
  // ): Promise<PaginatedViewDto<BlogViewDto[]>> {
  //   const response = await request(this.app.getHttpServer() as Server)
  //     .get(`/${GLOBAL_PREFIX}/blogs`)
  //     .query(query || {})
  //     .expect(statusCode);

  //   return response.body as PaginatedViewDto<BlogViewDto[]>;
  // }
}
