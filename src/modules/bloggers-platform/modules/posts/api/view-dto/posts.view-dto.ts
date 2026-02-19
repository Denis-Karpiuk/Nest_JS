import { LikeStatusEnum } from '../../../likes/domain/dto/like-status-enum';
import { Post } from '../../domain/post.entity';

export class NewestLikeDto {
  addedAt: Date;
  userId: string;
  login: string;
}

class ExtendedLikesInfoDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
  newestLikes: NewestLikeDto[];
}

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;

  extendedLikesInfo: ExtendedLikesInfoDto;

  static mapToView(
    post: Post,
    blogName?: string,
    extendedLikesInfo?: ExtendedLikesInfoDto,
  ): PostsViewDto {
    const dto = new PostsViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.createdAt = post.createdAt;
    dto.blogName = blogName || '';

    dto.extendedLikesInfo = extendedLikesInfo || {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatusEnum.None,
      newestLikes: [],
    };

    return dto;
  }
}
