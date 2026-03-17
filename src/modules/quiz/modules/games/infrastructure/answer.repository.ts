import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../domain/answer.entity';
import { Repository } from 'typeorm';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';

@Injectable()
export class AnswerRepository {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async findByPlayerId(playerId: string): Promise<Answer[]> {
    return await this.answerRepository.find({
      where: { player: { id: playerId } },
    });
  }

  async findByQuestionIdOrNotFoundFail(questionId: string): Promise<Answer> {
    const answer = await this.answerRepository.findOne({
      where: { questionId },
    });
    if (!answer) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Answer not found',
      });
    }
    return answer;
  }

  async save(answer: Answer): Promise<void> {
    await this.answerRepository.save(answer);
  }
}
