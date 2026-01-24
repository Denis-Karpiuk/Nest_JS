import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CommentViewDto } from 'src/modules/bloggers-platform/modules/comments/api/view-dto/comment.view-dto';
import { CreatePostCommentInputDto } from 'src/modules/bloggers-platform/modules/posts/api/input-dto/create-post-comment.input.dto';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from 'src/modules/bloggers-platform/modules/posts/api/input-dto/create-post.input.dto';
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

  async updatePost(
    postId: Types.ObjectId,
    dto: UpdatePostInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer() as Server)
      .put(`/${GLOBAL_PREFIX}/posts/${postId.toString()}`)
      .send(dto)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async getPost(
    postId: Types.ObjectId,
    statusCode: number = HttpStatus.OK,
  ): Promise<PostsViewDto> {
    const response = await request(this.app.getHttpServer() as Server)
      .get(`/${GLOBAL_PREFIX}/posts/${postId.toString()}`)
      .expect(statusCode);

    return response.body as PostsViewDto;
  }

  async deletePost(
    postId: Types.ObjectId,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer() as Server)
      .delete(`/${GLOBAL_PREFIX}/posts/${postId.toString()}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async getAllPosts(
    query?: Record<string, any>,
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const response = await request(this.app.getHttpServer() as Server)
      .get(`/${GLOBAL_PREFIX}/posts`)
      .query(query || {})
      .expect(statusCode);

    return response.body as PaginatedViewDto<PostsViewDto[]>;
  }

  async createComment(
    postId: Types.ObjectId,
    createCommentBody: CreatePostCommentInputDto,
    accessToken: string,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer() as Server)
      .post(`/${GLOBAL_PREFIX}/posts/${postId.toString()}/comments`)
      .send(createCommentBody)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);

    return response.body as CommentViewDto;
  }
}
