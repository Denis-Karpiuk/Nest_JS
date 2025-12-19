import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, type PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostsViewDto } from '../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetPostsQueryParamsDto } from '../api/input-dto/get-posts-query-params.input.dto';
import { BlogsExternalQueryRepository } from '../../blogs/infrastructure/blogs.external-query-repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostsViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    const blogName =
      await this.blogsExternalQueryRepository.getBlogNameByBlogId(post.blogId);

    return PostsViewDto.mapToView(post, blogName);
  }

  async getAllPosts(
    query: GetPostsQueryParamsDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const posts = await this.PostModel.find()
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const blogId = posts[0].blogId;

    const blogName =
      await this.blogsExternalQueryRepository.getBlogNameByBlogId(blogId);

    const items = posts.map((post) => PostsViewDto.mapToView(post, blogName));

    const totalCount = await this.PostModel.countDocuments();

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
