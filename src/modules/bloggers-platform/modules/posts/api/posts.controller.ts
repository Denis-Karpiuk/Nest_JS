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
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from 'src/modules/users-accounts/guards/basic/basic-auth.guard';
import { JwtAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-auth.guard';
import { JwtOptionalAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/users-accounts/guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';
import { GetCommentsQueryParamsDto } from '../../comments/api/input-dto/get-comments-query-params.input.dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { CommentsExternalQueryRepository } from '../../comments/infrastructure/external-query/comments.exteranl-query-repository';
import { AddPostLikeStatusCommand } from '../../likes/application/usecases/add-post-like-status.usecase';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.queries-handler';
import { GetPostsQuery } from '../application/queries/get-posts.queries-handler';
import { CreatePostCommentCommand } from '../application/usecases/create-post-comment.usecase';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { CreatePostCommentInputDto } from './input-dto/create-post-comment.input.dto';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from './input-dto/create-post.input.dto';
import { GetPostsQueryParamsDto } from './input-dto/get-posts-query-params.input.dto';
import { LikePostInputDto } from './input-dto/like-post.input.dto';
import { PostsViewDto } from './view-dto/posts.view-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
    private commentsExternalQueryRepository: CommentsExternalQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(dto),
    );

    return this.queryBus.execute<GetPostByIdQuery, PostsViewDto>(
      new GetPostByIdQuery(postId),
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getPost(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ) {
    return this.queryBus.execute<GetPostByIdQuery, PostsViewDto>(
      new GetPostByIdQuery(id, user?.id),
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getPosts(
    @Query() query: GetPostsQueryParamsDto,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.queryBus.execute<
      GetPostsQuery,
      PaginatedViewDto<PostsViewDto[]>
    >(new GetPostsQuery(query, user?.id));
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') id: string, @Body() dto: UpdatePostInputDto) {
    return this.commandBus.execute<UpdatePostCommand, string>(
      new UpdatePostCommand(id, dto),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    return this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createComment(
    @Param('id') id: string,
    @Body() dto: CreatePostCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    await this.queryBus.execute<GetPostByIdQuery, PostsViewDto>(
      new GetPostByIdQuery(id),
    );
    const commentId = await this.commandBus.execute<
      CreatePostCommentCommand,
      string
    >(new CreatePostCommentCommand(id, dto, user));

    return this.commentsExternalQueryRepository.getByIdOrNotFoundFail(
      commentId,
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/comments')
  async getCommentsByPostId(
    @Param('id') id: string,
    @Query() query: GetCommentsQueryParamsDto,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.queryBus.execute<GetPostByIdQuery, PostsViewDto>(
      new GetPostByIdQuery(id),
    );
    return this.commentsExternalQueryRepository.getAllCommentsByPostId(
      id,
      query,
      user?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likePost(
    @Param('id') id: string,
    @Body() dto: LikePostInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    await this.queryBus.execute<GetPostByIdQuery, PostsViewDto>(
      new GetPostByIdQuery(id),
    );
    await this.commandBus.execute<AddPostLikeStatusCommand, void>(
      new AddPostLikeStatusCommand(id.toString(), user.id, dto.likeStatus),
    );
  }
}
