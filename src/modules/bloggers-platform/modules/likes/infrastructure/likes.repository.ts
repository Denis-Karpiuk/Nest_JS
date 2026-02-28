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
    return this.likesRepository
      .createQueryBuilder('l')
      .where('l.post.id = :postId', { postId })
      .orderBy('l.createdAt', 'DESC')
      .getMany();
  }

  async findAllByCommentId(commentId: string): Promise<Like[]> {
    return this.likesRepository
      .createQueryBuilder('l')
      .where('l.comment.id = :commentId', { commentId })
      .orderBy('l.createdAt', 'DESC')
      .getMany();
  }

  async findAllPostsLikes(postId: string): Promise<Like[]> {
    return this.findAllByPostId(postId);
  }

  async findById(id: string): Promise<Like | null> {
    return this.likesRepository
      .createQueryBuilder('l')
      .where('l.id = :id', { id })
      .getOne();
  }

  async findByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<Like | null> {
    return this.likesRepository
      .createQueryBuilder('l')
      .where('l.post.id = :postId', { postId })
      .andWhere('l.user.id = :userId', { userId })
      .getOne();
  }

  async findByCommentAndUser(
    commentId: string,
    userId: string,
  ): Promise<Like | null> {
    return this.likesRepository
      .createQueryBuilder('l')
      .where('l.comment.id = :commentId', { commentId })
      .andWhere('l.user.id = :userId', { userId })
      .getOne();
  }

  async save(like: Like) {
    await this.likesRepository.save(like);
  }
}
