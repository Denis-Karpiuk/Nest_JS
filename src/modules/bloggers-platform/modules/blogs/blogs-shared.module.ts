import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blog.entity';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { BlogsExternalQueryRepository } from './infrastructure/blogs.external-query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  providers: [BlogsQueryRepository, BlogsExternalQueryRepository],
  exports: [BlogsExternalQueryRepository],
})
export class BlogsSharedModule {}
