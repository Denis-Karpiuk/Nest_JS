import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { LikesPostsQueryRepository } from '../../../likes/infrastructure/likes.posts.query-repository';
import { BlogsExternalQueryRepository } from '../../../blogs/infrastructure/blogs.external-query-repository';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';

export class GetPostByIdQuery {
  constructor(
    public id: Types.ObjectId,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly likesPostsQueryRepository: LikesPostsQueryRepository,
    private readonly blogsExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async execute(query: GetPostByIdQuery): Promise<PostsViewDto> {
    const post = await this.postsQueryRepository.getByIdOrNotFoundFail(
      query.id,
    );

    const blogName =
      await this.blogsExternalQueryRepository.getBlogNameByBlogId(post.blogId);

    const extendedLikesInfo =
      await this.likesPostsQueryRepository.getPostsLikesInfo(
        post._id.toString(),
        query?.userId,
      );

    return PostsViewDto.mapToView(post, blogName, extendedLikesInfo);
  }
}
