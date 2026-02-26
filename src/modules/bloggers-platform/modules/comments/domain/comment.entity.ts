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
import { User } from 'src/modules/users-accounts/domain/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  commentator: User;

  static createInstance(dto: CreateCommentDomainDto): Comment {
    const comment = new this();

    comment.post = { id: dto.postId } as Post;
    comment.content = dto.content;
    comment.commentator = { id: dto.commentatorId } as User;

    return comment;
  }

  update(content: string) {
    this.content = content;
  }
}
