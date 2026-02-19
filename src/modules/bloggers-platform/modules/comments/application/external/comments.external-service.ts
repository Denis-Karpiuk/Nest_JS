import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/comment.entity';
import { CreateCommentDomainDto } from '../../domain/dto/create-comment.domain.dto';

@Injectable()
export class CommentsExternalService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async createComment(dto: CreateCommentDomainDto): Promise<string> {
    const comment = Comment.createInstance(dto);

    await this.commentsRepository.save(comment);

    return comment.id;
  }
}
