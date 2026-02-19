import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  postId: string;

  @Column()
  commentatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  static createInstance(dto: CreateCommentDomainDto): Comment {
    const comment = new this();

    comment.postId = dto.postId;
    comment.content = dto.content;
    comment.commentatorId = dto.commentatorId;

    return comment;
  }

  update(content: string) {
    this.content = content;
  }
}
