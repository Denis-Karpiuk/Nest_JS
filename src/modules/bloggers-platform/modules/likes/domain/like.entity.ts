import { LikeStatusEnum } from './dto/like-status-enum';
import { CreateLikeDto } from './dto/create-like.dto';
import { EntityType } from './dto/entity-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityId: string;

  @Column()
  entityType: EntityType;

  @Column()
  likeStatus: LikeStatusEnum;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static createInstance(dto: CreateLikeDto): Like {
    const like = new this();
    like.entityId = dto.entityId;
    like.entityType = dto.entityType;
    like.likeStatus = dto.likeStatus;
    like.userId = dto.userId;

    return like;
  }

  update(likeStatus: LikeStatusEnum) {
    this.likeStatus = likeStatus;
  }
}
