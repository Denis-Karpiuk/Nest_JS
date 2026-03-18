import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameQuestionQueryRepository } from '../../infrastructure/game.question.query.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class GetGameByIdQuery {
  constructor(public readonly dto: { gameId: string; userId: string }) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdQueryHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameQuestionQueryRepository: GameQuestionQueryRepository,
  ) {}

  async execute({ dto }: GetGameByIdQuery): Promise<GameViewDto> {
    const game = await this.gameQueryRepository.getByIdOrNotFoundFail(
      dto.gameId,
    );

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

    return GameViewDto.mapToView(game, questions);
  }
}
