import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post.entity';

import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetPostsQueryParamsDto } from '../../api/input-dto/get-posts-query-params.input.dto';
import { BlogsExternalQueryRepository } from '../../../blogs/infrastructure/blogs.external-query-repository';
import { PostsExternalViewDto } from './external-dto/posts.external-dto';
import { LikesPostsQueryRepository } from '../../../likes/infrastructure/likes.posts.query-repository';

@Injectable()
export class PostsExternalQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
    private likesPostsQueryRepository: LikesPostsQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostsExternalViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('post not found');
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

    const posts = await this.PostModel.find({ blogId: blogId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const items = await Promise.all(
      posts.map(async (post) => {
        const extendedLikesInfo =
          await this.likesPostsQueryRepository.getPostsLikesInfo(
            post._id.toString(),
            userId,
          );

        return PostsExternalViewDto.mapToView(
          post,
          blogName,
          extendedLikesInfo,
        );
      }),
    );

    const totalCount = await this.PostModel.countDocuments({ blogId: blogId });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
