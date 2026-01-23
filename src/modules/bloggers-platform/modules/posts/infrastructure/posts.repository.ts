import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Post, PostDocument, type PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(id: Types.ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: id,
    });
  }

  async findOrNotFoundFail(id: Types.ObjectId): Promise<PostDocument> {
    const blog = await this.findById(id);

    if (!blog) {
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

    return blog;
  }

  async deletePost(id: Types.ObjectId) {
    return this.PostModel.deleteOne({
      _id: id,
    });
  }

  async save(post: PostDocument) {
    await post.save();
  }
}
