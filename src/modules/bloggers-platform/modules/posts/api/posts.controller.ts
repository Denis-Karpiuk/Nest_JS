import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from './input-dto/create-post.input.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostsViewDto } from './view-dto/posts.view-dto';
import { GetPostsQueryParamsDto } from './input-dto/get-posts-query-params.input.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.postsService.createPost(dto);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Get()
  async getPosts(
    @Query() query: GetPostsQueryParamsDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.postsQueryRepository.getAllPosts(query);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') id: string, @Body() dto: UpdatePostInputDto) {
    return this.postsService.updatePost(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
