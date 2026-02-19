import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { BlogsExternalQueryRepository } from '../../../blogs/infrastructure/blogs.external-query-repository';
import { LikesPostsQueryRepository } from '../../../likes/infrastructure/likes.posts.query-repository';
import { GetPostsQueryParamsDto } from '../../api/input-dto/get-posts-query-params.input.dto';
import { PostsRepository } from '../posts.repository';
import { PostsExternalViewDto } from './external-dto/posts.external-dto';

@Injectable()
export class PostsExternalQueryRepository {
  constructor(
    private postsRepository: PostsRepository,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
    private likesPostsQueryRepository: LikesPostsQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostsExternalViewDto> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [
          {
            field: 'postId',
            message: 'Post not found',
          },
        ],
      });
    }
    const blogName =
      await this.blogsExternalQueryRepository.getBlogNameByBlogId(post.blogId);

    return PostsExternalViewDto.mapToView(post, blogName);
  }

  async getAllPostsByBlogId(
    blogId: string,
    query: GetPostsQueryParamsDto,
    userId?: string,
  ): Promise<PaginatedViewDto<PostsExternalViewDto[]>> {
    const blogName =
      await this.blogsExternalQueryRepository.getBlogNameByBlogId(blogId);

    const sortOrder = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';
    const posts = await this.postsRepository.findPaginated({
      order: { [query.sortBy]: sortOrder },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const items = await Promise.all(
      posts.map(async (post) => {
        const extendedLikesInfo =
          await this.likesPostsQueryRepository.getPostsLikesInfo(
            post.id,
            userId,
          );

        return PostsExternalViewDto.mapToView(
          post,
          blogName,
          extendedLikesInfo,
        );
      }),
    );

    const totalCount = await this.postsRepository.countPostsByBlogId(blogId);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
