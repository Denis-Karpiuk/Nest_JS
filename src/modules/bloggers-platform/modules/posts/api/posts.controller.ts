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
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { ObjectIdValidationPipe } from 'src/core/pipes/object-id-validation-transformation-pipe.service';
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

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getPost(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ) {
    return this.queryBus.execute<GetPostByIdQuery, PostsViewDto>(
      new GetPostByIdQuery(id, user?.id),
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createComment(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @Body() dto: CreatePostCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    const commentId = await this.commandBus.execute<
      CreatePostCommentCommand,
      Types.ObjectId
    >(new CreatePostCommentCommand(id, dto, user));

    return this.commentsExternalQueryRepository.getByIdOrNotFoundFail(
      commentId,
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/comments')
  async getCommentsByPostId(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @Query() query: GetCommentsQueryParamsDto,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
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
    await this.commandBus.execute<AddPostLikeStatusCommand, void>(
      new AddPostLikeStatusCommand(id, user.id, dto.likeStatus),
    );
  }
}
