import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<Question> {
    const question = await this.questionsRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
      .getOne();

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Question not found',
        extensions: [
          {
            field: 'questionId',
            message: 'Question not found',
          },
        ],
      });
    }

    return question;
  }
}
