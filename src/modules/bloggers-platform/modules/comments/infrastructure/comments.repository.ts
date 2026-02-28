import { Injectable } from '@nestjs/common';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Comment } from '../domain/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    return this.commentsRepository
      .createQueryBuilder('c')
      .where('c.id = :id', { id })
      .leftJoinAndSelect('c.commentator', 'commentator')
      .getOne();
  }

  async findOrNotFoundFail(id: string): Promise<Comment> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
        extensions: [
          {
            field: 'commentId',
            message: 'Comment not found',
          },
        ],
      });
    }

    return comment;
  }

  async deleteComment(
    id: string,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const result = await this.commentsRepository.delete({
      id,
    });
    return {
      acknowledged: true,
      deletedCount: result.affected ?? 0,
    };
  }

  async save(comment: Comment) {
    await this.commentsRepository.save(comment);
  }
}
