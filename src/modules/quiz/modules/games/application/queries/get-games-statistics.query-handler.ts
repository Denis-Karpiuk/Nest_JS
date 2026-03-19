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

    const dto = new MyGameStatisticViewDto();

    let sumScore = 0;
    let winsCount = 0;
    let lossesCount = 0;
    let drawsCount = 0;

    for (const game of finishedGames) {
      const firstIsUser = game.firstPlayer.playerAccount.id === userId;
      const userPlayer = firstIsUser ? game.firstPlayer : game.secondPlayer;
      const opponentPlayer = firstIsUser ? game.secondPlayer : game.firstPlayer;

      // Для Finished ожидаем, что второй игрок существует,
      // но на всякий случай защищаемся от null.
      if (!userPlayer || !opponentPlayer) continue;

      const userScore = userPlayer.score;
      const opponentScore = opponentPlayer.score;

      sumScore += userScore;

      if (userScore > opponentScore) winsCount += 1;
      else if (userScore < opponentScore) lossesCount += 1;
      else drawsCount += 1;
    }

    const gamesCount = finishedGames.length;
    const avgScores = gamesCount ? sumScore / gamesCount : 0;
    // Округляем до 2 знаков после запятой (число, а не строка).
    const roundedAvgScores = Math.round(avgScores * 100) / 100;

    dto.sumScore = sumScore;
    dto.avgScores = roundedAvgScores;
    dto.gamesCount = gamesCount;
    dto.winsCount = winsCount;
    dto.lossesCount = lossesCount;
    dto.drawsCount = drawsCount;

    return dto;
  }
}
