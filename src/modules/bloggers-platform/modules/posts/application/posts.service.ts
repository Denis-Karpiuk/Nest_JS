import { Injectable } from '@nestjs/common';
import { Post, type PostModelType } from '../domain/post.entity';
import { CreatePostDto, UpdatePostDto } from '../dto/create-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto) {
    const post = this.PostModel.createInstance(dto);

    await this.postsRepository.save(post);

    return post._id.toString();
  }

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
