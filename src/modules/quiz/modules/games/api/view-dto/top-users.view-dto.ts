export class TopUsersViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: {
    id: string;
    login: string;
  };

  static mapToView(input: {
    player: { id: string; login: string };
    sumScore: number;
    avgScores: number;
    gamesCount: number;
    winsCount: number;
    lossesCount: number;
    drawsCount: number;
  }): TopUsersViewDto {
    return {
      sumScore: input.sumScore,
      avgScores: input.avgScores,
      gamesCount: input.gamesCount,
      winsCount: input.winsCount,
      lossesCount: input.lossesCount,
      drawsCount: input.drawsCount,
      player: input.player,
    } as TopUsersViewDto;
  }
}
