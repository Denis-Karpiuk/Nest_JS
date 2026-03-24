import { LikeStatusEnum } from './dto/like-status-enum';
import { CreateLikeDto } from './dto/create-like.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users-accounts/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';
import { Comment } from '../../comments/domain/comment.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  post?: Post;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  comment?: Comment;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: LikeStatusEnum })
  likeStatus: LikeStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static createInstance(dto: CreateLikeDto): Like {
    const like = new this();
    like.likeStatus = dto.likeStatus;
    like.user = { id: dto.userId } as User;
    if (dto.postId) {
      like.post = { id: dto.postId } as Post;
    }
    if (dto.commentId) {
      like.comment = { id: dto.commentId } as Comment;
    }
    return like;
  }

  update(likeStatus: LikeStatusEnum) {
    this.likeStatus = likeStatus;
  }
}
