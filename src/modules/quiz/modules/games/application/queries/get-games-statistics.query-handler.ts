import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { MyGameStatisticViewDto } from '../../api/view-dto/my-game-statistic.view-dto';

export class GetGamesStatisticsQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetGamesStatisticsQuery)
export class GetGamesStatisticsQueryHandler implements IQueryHandler<GetGamesStatisticsQuery> {
  constructor(private readonly gameQueryRepository: GameQueryRepository) {}

  async execute({
    userId,
  }: GetGamesStatisticsQuery): Promise<MyGameStatisticViewDto> {
    const finishedGames =
      await this.gameQueryRepository.getFinishedGamesByUserId(userId);
    return MyGameStatisticViewDto.mapToView(finishedGames, userId);
  }
}
