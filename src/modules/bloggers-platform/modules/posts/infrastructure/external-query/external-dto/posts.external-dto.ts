import { LikeStatusEnum } from 'src/modules/bloggers-platform/modules/likes/domain/dto/like-status-enum';
import { PostDocument } from '../../../domain/post.entity';

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

export class PostsExternalViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;

  extendedLikesInfo: ExtendedLikesInfoDto;

  static mapToView(
    post: PostDocument,
    blogName?: string,
    extendedLikesInfo?: ExtendedLikesInfoDto,
  ): PostsExternalViewDto {
    const dto = new PostsExternalViewDto();

    dto.id = post._id.toString();
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
