import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post.entity';
import { PostExternalDto } from './external-dto/posts.external-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetPostsQueryParamsDto } from '../../api/input-dto/get-posts-query-params.input.dto';

@Injectable()
export class PostsExternalQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    blogName: string,
  ): Promise<PostExternalDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return PostExternalDto.mapToView(post, blogName);
  }

  async getAllPostsByBlogId(
    blogId: string,
    blogName: string,
    query: GetPostsQueryParamsDto,
  ): Promise<PaginatedViewDto<PostExternalDto[]>> {
    const posts = await this.PostModel.find({ blogId: blogId })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const items = posts.map((post) =>
      PostExternalDto.mapToView(post, blogName),
    );

    const totalCount = await this.PostModel.countDocuments();

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
