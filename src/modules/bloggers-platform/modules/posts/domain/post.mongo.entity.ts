import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostDomainDto } from './dto/create-post-domain.dto';
import { HydratedDocument, Model } from 'mongoose';
import { UpdatePostDto } from '../dto/create-post.dto';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, max: 30, required: true })
  title: string;

  @Prop({ type: String, max: 100, required: true })
  shortDescription: string;

  @Prop({ type: String, max: 1000, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreatePostDomainDto) {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;

    return post as PostDocument;
  }

  update(dto: UpdatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

//регистрирует методы сущности в схеме
PostSchema.loadClass(Post);

//Типизация документа
export type PostDocument = HydratedDocument<Post>;

//Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;
