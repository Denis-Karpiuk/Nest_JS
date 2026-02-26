import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '../domain/like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
  ) {}

  async findAllByPostId(postId: string): Promise<Like[]> {
    return this.likesRepository.find({
      where: { post: { id: postId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByCommentId(commentId: string): Promise<Like[]> {
    return this.likesRepository.find({
      where: { comment: { id: commentId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPostsLikes(postId: string): Promise<Like[]> {
    return this.findAllByPostId(postId);
  }

  async findById(id: string): Promise<Like | null> {
    return this.likesRepository.findOne({ where: { id } });
  }

  async findByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<Like | null> {
    return this.likesRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });
  }

  async findByCommentAndUser(
    commentId: string,
    userId: string,
  ): Promise<Like | null> {
    return this.likesRepository.findOne({
      where: { comment: { id: commentId }, user: { id: userId } },
    });
  }

  async save(like: Like) {
    await this.likesRepository.save(like);
  }
}
