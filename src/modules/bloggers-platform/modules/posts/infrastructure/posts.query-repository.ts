import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { BlogsExternalQueryRepository } from '../../blogs/infrastructure/blogs.external-query-repository';
import { LikesPostsQueryRepository } from '../../likes/infrastructure/likes.posts.query-repository';
import { GetPostsQueryParamsDto } from '../api/input-dto/get-posts-query-params.input.dto';
import { PostsSortBy } from '../api/input-dto/posts-sort-by';
import { PostsViewDto } from '../api/view-dto/posts.view-dto';
import { Post } from '../domain/post.entity';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    private readonly postsRepository: PostsRepository,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
    private likesPostsQueryRepository: LikesPostsQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(postId: string): Promise<Post> {
    const post = await this.postsRepository.findOrNotFoundFail(postId);

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

    return post;
  }

  async getAllPosts(
    query: GetPostsQueryParamsDto,
    userId?: string,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const totalCount = await this.postsRepository.countPosts();

    const sortOrder = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    // Если сортировка по blogName, нужно загрузить все посты и отсортировать в памяти
    if (query.sortBy === PostsSortBy.BlogName) {
      const allPosts = await this.postsRepository.findAll();

      const postsWithBlogName = await Promise.all(
        allPosts.map(async (post) => {
          const blogName =
            await this.blogsExternalQueryRepository.getBlogNameByBlogId(
              post.blogId,
            );
          return {
            post,
            blogName,
          };
        }),
      );

      postsWithBlogName.sort((a, b) => {
        if (query.sortDirection === SortDirection.Asc) {
          return a.blogName.localeCompare(b.blogName);
        } else {
          return b.blogName.localeCompare(a.blogName);
        }
      });

      const paginatedPosts = postsWithBlogName.slice(
        query.calculateSkip(),
        query.calculateSkip() + query.pageSize,
      );

      const items = await Promise.all(
        paginatedPosts.map(async ({ post, blogName }) => {
          const extendedLikesInfo =
            await this.likesPostsQueryRepository.getPostsLikesInfo(
              post.id,
              userId,
            );
          return PostsViewDto.mapToView(post, blogName, extendedLikesInfo);
        }),
      );

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: query.pageNumber,
        size: query.pageSize,
      });
    }

    const posts = await this.postsRepository.findPaginated({
      order: { [query.sortBy]: sortOrder },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const items = await Promise.all(
      posts.map(async (post) => {
        const blogName =
          await this.blogsExternalQueryRepository.getBlogNameByBlogId(
            post.blogId,
          );
        const extendedLikesInfo =
          await this.likesPostsQueryRepository.getPostsLikesInfo(
            post.id,
            userId,
          );

        return PostsViewDto.mapToView(post, blogName, extendedLikesInfo);
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
