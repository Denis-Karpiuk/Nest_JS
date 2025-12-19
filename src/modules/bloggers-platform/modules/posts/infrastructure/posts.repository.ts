import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostDocument, type PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: id,
    });
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('post not found');
    }

    return blog;
  }

  async deletePost(id: string) {
    return this.PostModel.deleteOne({
      _id: id,
    });
  }

  async save(post: PostDocument) {
    await post.save();
  }
}
