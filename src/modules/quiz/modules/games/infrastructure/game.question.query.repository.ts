import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameQuestion } from '../domain/game-question.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { Question } from '../../questions/domain/question.entity';

@Injectable()
export class GameQuestionQueryRepository {
  constructor(
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
  ) {}

  async findByGameIdOrNotFoundFail(gameId: string): Promise<GameQuestion[]> {
    const gameQuestions = await this.gameQuestionRepository
      .createQueryBuilder('gameQuestion')
      .where('gameQuestion.gameId = :gameId', { gameId })
      .leftJoinAndSelect('gameQuestion.question', 'question')
      .getMany();

    if (!gameQuestions) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game questions not found',
      });
    }

    return gameQuestions;
  }

  async findManyByGameId(gameId: string): Promise<Question[]> {
    const gameQuestions = await this.gameQuestionRepository
      .createQueryBuilder('gameQuestion')
      .where('gameQuestion.gameId = :gameId', { gameId })
      .leftJoinAndSelect('gameQuestion.question', 'question')
      .getMany();

    return gameQuestions.map((gq) => gq.question);
  }
}
