import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const WEB_SITE_REG_EXP =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, max: 15, required: true })
  name: string;

  @Prop({ type: String, max: 500, required: true })
  description: string;

  @Prop({
    type: String,
    max: 100,
    match: WEB_SITE_REG_EXP,
    required: true,
  })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true, default: true })
  isMembership: boolean;

  createdAt: Date;
  updatedAt: Date;

  get id() {
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = true;

    return blog as BlogDocument;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

//регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);

//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;

//Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
