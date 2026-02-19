import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { PostsRepository } from './../infrastructure/posts.repository';

@Injectable()
export class PostsExternalService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async createPost(dto: CreatePostDto) {
    const post = Post.createInstance(dto);

    await this.postsRepository.save(post);

    return post.id;
  }
}
