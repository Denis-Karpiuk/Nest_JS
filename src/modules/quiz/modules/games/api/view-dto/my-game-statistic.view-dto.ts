import { Game } from '../../domain/game.entity';

export class MyGameStatisticViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;

  static mapToView(myGames: Game[], userId: string): MyGameStatisticViewDto {
    const dto = new MyGameStatisticViewDto();

    let sumScore = 0;
    let winsCount = 0;
    let lossesCount = 0;
    let drawsCount = 0;

    for (const game of myGames) {
      const firstIsUser = game.firstPlayer?.playerAccount.id === userId;
      const userPlayer = firstIsUser ? game.firstPlayer : game.secondPlayer;
      const opponentPlayer = firstIsUser ? game.secondPlayer : game.firstPlayer;

      if (!userPlayer || !opponentPlayer) continue;

      const userScore = userPlayer.score;
      const opponentScore = opponentPlayer.score;

      sumScore += userScore;

      if (userScore > opponentScore) winsCount += 1;
      else if (userScore < opponentScore) lossesCount += 1;
      else drawsCount += 1;
    }

    const gamesCount = myGames.length;
    const avgScores = gamesCount ? sumScore / gamesCount : 0;
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
