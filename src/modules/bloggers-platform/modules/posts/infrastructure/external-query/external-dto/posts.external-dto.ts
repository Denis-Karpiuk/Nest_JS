import { Injectable } from '@nestjs/common';
import { PostDocument } from '../../../domain/post.entity';

@Injectable()
export class PostExternalDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'None';
    newestLikes: [];
  };

  static mapToView(post: PostDocument, blogName: string): PostExternalDto {
    const dto = new PostExternalDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.createdAt = post.createdAt;
    dto.blogName = blogName;

    dto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };

    return dto;
  }
}
