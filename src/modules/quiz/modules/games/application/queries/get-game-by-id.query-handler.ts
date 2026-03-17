import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameQuestionQueryRepository } from '../../infrastructure/game.question.query.repository';

export class GetGameByIdQuery {
  constructor(public readonly gameId: string) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdQueryHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameQuestionQueryRepository: GameQuestionQueryRepository,
  ) {}

  async execute(query: GetGameByIdQuery): Promise<GameViewDto> {
    const game = await this.gameQueryRepository.getByIdOrNotFoundFail(
      query.gameId,
    );

    const questions = await this.gameQuestionQueryRepository.findManyByGameId(
      query.gameId,
    );

    return GameViewDto.mapToView(game, questions);
  }
}
