import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameQuestionQueryRepository } from '../../infrastructure/game.question.query.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class GetUserCurrentGameQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserCurrentGameQuery)
export class GetUserCurrentGameQueryHandler implements IQueryHandler<GetUserCurrentGameQuery> {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameQuestionQueryRepository: GameQuestionQueryRepository,
  ) {}

  async execute({ userId }: GetUserCurrentGameQuery): Promise<GameViewDto> {
    const player =
      await this.playerRepository.findByUserIdOrNotFoundFail(userId);

    const game = await this.gameQueryRepository.getGameByPlayerId(player.id);

    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game not found',
      });
    }

    console.log(game.id);

    const questions = await this.gameQuestionQueryRepository.findManyByGameId(
      game?.id,
    );

    return GameViewDto.mapToView(game, questions);
  }
}
