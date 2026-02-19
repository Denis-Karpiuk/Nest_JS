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
import { CreateBlogInputDto } from './input-dto/create-blog.input.dto';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetBlogsQueryParamsDto } from './input-dto/get-blogs-query-params.input.dto';
import { CreateBlogPostDto } from './input-dto/creat-blog-post.dto';
import { PostsExternalService } from '../../posts/application/posts.external-service';
import { PostsExternalQueryRepository } from '../../posts/infrastructure/external-query/posts.external-query-repository';
import { GetBlogsPostsQueryParamsDto } from './input-dto/get-blogs-posts-query-params';
import { BasicAuthGuard } from 'src/modules/users-accounts/guards/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { GetBlogBlogsQuery } from '../application/queries/get-blogs';
import { UpdatePostCommand } from '../../posts/application/usecases/update-post.usecase';
import { DeletePostCommand } from '../../posts/application/usecases/delete-post.usecase';
import { JwtOptionalAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/users-accounts/guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private readonly postsExternalService: PostsExternalService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsExternalQueryRepository: PostsExternalQueryRepository,

    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParamsDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute<
      GetBlogBlogsQuery,
      PaginatedViewDto<BlogViewDto[]>
    >(new GetBlogBlogsQuery(query));
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() dto: CreateBlogInputDto) {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(dto),
    );

    return this.queryBus.execute<GetBlogByIdQuery, BlogViewDto>(
      new GetBlogByIdQuery(blogId),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() dto: CreateBlogInputDto) {
    return this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(id, dto),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: GetBlogsPostsQueryParamsDto,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ) {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(id);

    return this.postsExternalQueryRepository.getAllPostsByBlogId(
      id,
      query,
      user?.id,
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPost(@Param('id') id: string, @Body() dto: CreateBlogPostDto) {
    const postId = await this.postsExternalService.createPost({
      blogId: id,
      ...dto,
    });

    return this.postsExternalQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') blogId: string,
    @Param('postId') postId: string,
    @Body() dto: CreateBlogPostDto,
  ) {
    return this.commandBus.execute<UpdatePostCommand, string>(
      new UpdatePostCommand(postId, { ...dto, blogId }),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id') _blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    return this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(postId),
    );
  }
}
