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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { ObjectIdValidationPipe } from 'src/core/pipes/object-id-validation-transformation-pipe.service';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.queries-handler';
import { GetPostsQuery } from '../application/queries/get-posts.queries-handler';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from './input-dto/create-post.input.dto';
import { GetPostsQueryParamsDto } from './input-dto/get-posts-query-params.input.dto';
import { PostsViewDto } from './view-dto/posts.view-dto';

@Controller('posts')
export class PostsController {
  constructor(
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
    return this.queryBus.execute<
      GetPostsQuery,
      PaginatedViewDto<PostsViewDto[]>
    >(new GetPostsQuery(query));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @Body() dto: UpdatePostInputDto,
  ) {
    return this.commandBus.execute<UpdatePostCommand, Types.ObjectId>(
      new UpdatePostCommand(id, dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', ObjectIdValidationPipe) id: Types.ObjectId) {
    return this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(id),
    );
  }
}
