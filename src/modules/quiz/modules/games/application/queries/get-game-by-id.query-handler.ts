import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameQuestionQueryRepository } from '../../infrastructure/game.question.query.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { UuidInputDto } from '../../api/input-dto/uuid.input.dto';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { AnswerViewDto } from '../../api/view-dto/answer.view-dto';
import { GameTimeoutService } from '../services/game-timeout.service';

export class GetGameByIdQuery {
  constructor(
    public readonly dto: { gameId: UuidInputDto['id']; userId: string },
  ) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdQueryHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameQuestionQueryRepository: GameQuestionQueryRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly gameTimeoutService: GameTimeoutService,
  ) {}

  async execute({ dto }: GetGameByIdQuery): Promise<GameViewDto> {
    let game = await this.gameQueryRepository.getByIdOrNotFoundFail(
      dto.gameId,
    );
    await this.gameTimeoutService.finishIfTimeoutExpired(game.id);
    game = await this.gameQueryRepository.getByIdOrNotFoundFail(dto.gameId);

    const firstPlayerUserId = game.firstPlayer?.playerAccount?.id;
    const secondPlayerUserId = game.secondPlayer?.playerAccount?.id;

    const isParticipant =
      firstPlayerUserId === dto.userId || secondPlayerUserId === dto.userId;

    if (!isParticipant) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not in this game',
        extensions: [
          {
            field: 'gameId',
            message: 'You are not in this game',
          },
        ],
      });
    }

    const questions = await this.gameQuestionQueryRepository.findManyByGameId(
      dto.gameId,
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
