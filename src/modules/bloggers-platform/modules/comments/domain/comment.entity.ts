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

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();

    comment.postId = dto.postId;
    comment.content = dto.content;
    comment.commentatorInfo = dto.commentatorInfo;

    return comment as CommentDocument;
  }

  update(content: string) {
    this.content = content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;
