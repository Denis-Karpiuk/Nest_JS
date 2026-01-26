import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, type LikeModelType, LikeDocument } from '../domain/like.entity';
import { EntityType } from '../domain/dto/entity-type.enum';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
  ) {}

  async findAllByEntityIdAndType(
    entityId: string,
    entityType: EntityType,
  ): Promise<LikeDocument[]> {
    return this.LikeModel.find({ entityId, entityType })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findAllPostsLikes(postId: string): Promise<LikeDocument[]> {
    return this.findAllByEntityIdAndType(postId, EntityType.Post);
  }

  async findById(id: string): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({ _id: id });
  }

  async findByEntityAndUser(
    entityId: string,
    entityType: EntityType,
    userId: string,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({
      entityId,
      entityType,
      userId,
    });
  }

  async save(like: LikeDocument) {
    await like.save();
  }
}
