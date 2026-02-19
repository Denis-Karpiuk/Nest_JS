import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '../domain/like.entity';
import { EntityType } from '../domain/dto/entity-type.enum';
import { Repository } from 'typeorm';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectRepository(Like) private readonly likesRepository: Repository<Like>,
  ) {}

  async findAllByEntityIdAndType(
    entityId: string,
    entityType: EntityType,
  ): Promise<Like[]> {
    return this.likesRepository.find({
      where: { entityId, entityType },
      order: { createdAt: -1 },
    });
  }

  async findAllPostsLikes(postId: string): Promise<Like[]> {
    return this.findAllByEntityIdAndType(postId, EntityType.Post);
  }

  async findById(id: string): Promise<Like | null> {
    return this.likesRepository.findOne({ where: { id } });
  }

  async findByEntityAndUser(
    entityId: string,
    entityType: EntityType,
    userId: string,
  ): Promise<Like | null> {
    return this.likesRepository.findOne({
      where: { entityId, entityType, userId },
    });
  }

  async save(like: Like) {
    await this.likesRepository.save(like);
  }
}
