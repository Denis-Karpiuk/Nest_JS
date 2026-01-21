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
import { BlogsService } from '../application/blogs.service';
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
import { Types } from 'mongoose';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id';
import { ObjectIdValidationPipe } from 'src/core/pipes/object-id-validation-transformation-pipe.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsExternalService: PostsExternalService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsExternalQueryRepository: PostsExternalQueryRepository,

    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParamsDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAllBlogs(query);
  }

  @Get(':id')
  async getBlogById(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
  ): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() dto: CreateBlogInputDto) {
    const blogId = await this.commandBus.execute<
      CreateBlogCommand,
      Types.ObjectId
    >(new CreateBlogCommand(dto));

    return this.queryBus.execute<GetBlogByIdQuery, BlogViewDto>(
      new GetBlogByIdQuery(blogId),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() dto: CreateBlogInputDto) {
    return this.blogsService.updateBlog(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }

  @Post(':id/posts')
  async createPost(@Param('id') id: string, @Body() dto: CreateBlogPostDto) {
    const postId = await this.postsExternalService.createPost({
      blogId: id,
      ...dto,
    });

    return this.postsExternalQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: GetBlogsPostsQueryParamsDto,
  ) {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(id);

    return this.postsExternalQueryRepository.getAllPostsByBlogId(id, query);
  }
}
