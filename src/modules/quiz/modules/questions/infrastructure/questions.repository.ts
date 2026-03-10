import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async findByIdOrNotFoundFail(id: string): Promise<Question> {
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

  async deleteQuestion(id: string): Promise<void> {
    await this.questionsRepository.delete({ id });
  }

  save(question: Question) {
    return this.questionsRepository.save(question);
  }
}
