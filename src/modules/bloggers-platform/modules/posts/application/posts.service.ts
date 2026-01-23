import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../domain/post.entity';
import { UpdatePostDto } from '../dto/create-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
  ) {}

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.postsRepository.findOrNotFoundFail(id);

    post.update(dto);

    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async deletePost(id: string) {
    await this.postsRepository.findOrNotFoundFail(id);

    await this.postsRepository.deletePost(id);
  }
}
