import { Module } from '@nestjs/common';
import { Blog } from './domain/blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { BlogsExternalQueryRepository } from './infrastructure/blogs.external-query-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Blog])],
  providers: [BlogsQueryRepository, BlogsExternalQueryRepository],
  exports: [BlogsExternalQueryRepository],
})
export class BlogsSharedModule {}
