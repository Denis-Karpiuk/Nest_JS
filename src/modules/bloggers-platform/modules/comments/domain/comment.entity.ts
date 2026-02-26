import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  commentatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  static createInstance(dto: CreateCommentDomainDto): Comment {
    const comment = new this();

    comment.post = { id: dto.postId } as Post;
    comment.content = dto.content;
    comment.commentatorId = dto.commentatorId;

    return comment;
  }

  update(content: string) {
    this.content = content;
  }
}
