import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameQuestionQueryRepository } from '../../infrastructure/game.question.query.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { AnswerViewDto } from '../../api/view-dto/answer.view-dto';

export class GetUserCurrentGameQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserCurrentGameQuery)
export class GetUserCurrentGameQueryHandler implements IQueryHandler<GetUserCurrentGameQuery> {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameQuestionQueryRepository: GameQuestionQueryRepository,
    private readonly answerRepository: AnswerRepository,
  ) {}

  async execute({ userId }: GetUserCurrentGameQuery): Promise<GameViewDto> {
    const game =
      await this.gameQueryRepository.findActiveOrPendingGameByUserId(userId);

    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game not found',
      });
    }

    const questions = await this.gameQuestionQueryRepository.findManyByGameId(
      game.id,
    );
    const questionIds = new Set(questions.map((q) => q.id));

    const firstPlayerAnswers = (
      await this.answerRepository.findByPlayerId(game.firstPlayer.id)
    )
      .filter((answer) => questionIds.has(answer.questionId))
      .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
      .map(AnswerViewDto.mapToView);

    const secondPlayerAnswers = game.secondPlayer
      ? (await this.answerRepository.findByPlayerId(game.secondPlayer.id))
          .filter((answer) => questionIds.has(answer.questionId))
          .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
          .map(AnswerViewDto.mapToView)
      : [];

    return GameViewDto.mapToView(
      game,
      questions,
      firstPlayerAnswers,
      secondPlayerAnswers,
    );
  }
}
