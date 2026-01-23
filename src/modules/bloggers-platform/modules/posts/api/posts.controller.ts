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
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from './input-dto/create-post.input.dto';
import { GetPostsQueryParamsDto } from './input-dto/get-posts-query-params.input.dto';
import { PostsViewDto } from './view-dto/posts.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { Types } from 'mongoose';
import { ObjectIdValidationPipe } from 'src/core/pipes/object-id-validation-transformation-pipe.service';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,

    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.commandBus.execute<
      CreatePostCommand,
      Types.ObjectId
    >(new CreatePostCommand(dto));

    return this.queryBus.execute<GetPostByIdQuery, PostsViewDto>(
      new GetPostByIdQuery(postId),
    );
  }

  @Get(':id')
  async getPost(@Param('id', ObjectIdValidationPipe) id: Types.ObjectId) {
    return this.queryBus.execute<GetPostByIdQuery, PostsViewDto>(
      new GetPostByIdQuery(id),
    );
  }

  @Get()
  async getPosts(
    @Query() query: GetPostsQueryParamsDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.postsQueryRepository.getAllPosts(query);
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
