import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { HydratedDocument, Model } from 'mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './commentatorInfo.schema';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, min: 20, max: 300, required: true })
  content: string;

  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateCommentDomainDto): Comment {
    const comment = new this();

    comment.content = dto.content;
    return comment;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;
