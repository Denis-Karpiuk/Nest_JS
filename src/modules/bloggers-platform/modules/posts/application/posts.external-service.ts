import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from './../infrastructure/posts.repository';
import { Injectable } from '@nestjs/common';
import { Post, type PostModelType } from '../domain/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class PostsExternalService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private PostsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto) {
    const post = this.PostModel.createInstance(dto);

    await this.PostsRepository.save(post);

    return post._id.toString();
  }
}
