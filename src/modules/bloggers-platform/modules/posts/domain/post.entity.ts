import { CreatePostDomainDto } from './dto/create-post-domain.dto';

import { UpdatePostDto } from '../dto/create-post.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';

import { Comment } from '../../comments/domain/comment.entity';
import type { Like } from '../../likes/domain/like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.posts, { onDelete: 'CASCADE' })
  blog: Blog;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany('Like', (like: Like) => like.post)
  likes: Like[];

  static createInstance(dto: CreatePostDomainDto): Post {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blog = { id: dto.blogId } as Blog;

    return post;
  }

  update(dto: UpdatePostDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blog = { id: dto.blogId } as Blog;
  }
}
