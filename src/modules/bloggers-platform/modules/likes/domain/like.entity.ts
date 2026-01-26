import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusEnum } from './dto/like-status-enum';
import { CreateLikeDto } from './dto/create-like.dto';
import { HydratedDocument, Model } from 'mongoose';
import { EntityType } from './dto/entity-type.enum';

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: String, required: true })
  entityId: string;

  @Prop({ type: String, enum: EntityType, required: true })
  entityType: EntityType;

  @Prop({
    type: String,
    enum: LikeStatusEnum,
    default: LikeStatusEnum.None,
    required: true,
  })
  likeStatus: LikeStatusEnum;

  @Prop({ type: String, required: true })
  userId: string;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateLikeDto): LikeDocument {
    const like = new this();
    like.entityId = dto.entityId;
    like.entityType = dto.entityType;
    like.likeStatus = dto.likeStatus;
    like.userId = dto.userId;

    return like as LikeDocument;
  }

  update(likeStatus: LikeStatusEnum) {
    this.likeStatus = likeStatus;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

//регистрирует методы сущности в схеме
LikeSchema.loadClass(Like);

//Типизация документа
export type LikeDocument = HydratedDocument<Like>;

//Типизация модели + статические методы
export type LikeModelType = Model<LikeDocument> & typeof Like;
