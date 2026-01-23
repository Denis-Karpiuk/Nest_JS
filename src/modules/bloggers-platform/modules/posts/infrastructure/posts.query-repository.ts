import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, type PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostsViewDto } from '../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetPostsQueryParamsDto } from '../api/input-dto/get-posts-query-params.input.dto';
import { BlogsExternalQueryRepository } from '../../blogs/infrastructure/blogs.external-query-repository';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';
import { PostsSortBy } from '../api/input-dto/posts-sort-by';
import { Types } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(id: Types.ObjectId): Promise<PostsViewDto> {
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
    const totalCount = await this.PostModel.countDocuments();

    // Если сортировка по blogName, нужно загрузить все посты и отсортировать в памяти
    if (query.sortBy === PostsSortBy.BlogName) {
      const allPosts = await this.PostModel.find();

      // Добавляем blogName к каждому посту
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

      // Сортируем по blogName
      postsWithBlogName.sort((a, b) => {
        if (query.sortDirection === SortDirection.Asc) {
          return a.blogName.localeCompare(b.blogName);
        } else {
          return b.blogName.localeCompare(a.blogName);
        }
      });

      // Применяем пагинацию
      const paginatedPosts = postsWithBlogName.slice(
        query.calculateSkip(),
        query.calculateSkip() + query.pageSize,
      );

      const items = paginatedPosts.map(({ post, blogName }) =>
        PostsViewDto.mapToView(post, blogName),
      );

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: query.pageNumber,
        size: query.pageSize,
      });
    }

    // Обычная сортировка по полям из БД
    const posts = await this.PostModel.find()
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const items = await Promise.all(
      posts.map(async (post) => {
        const blogName =
          await this.blogsExternalQueryRepository.getBlogNameByBlogId(
            post.blogId,
          );
        return PostsViewDto.mapToView(post, blogName);
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
