import { Game } from '../../domain/game.entity';

export class MyGameStatisticViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;

  static mapToView(myGames: Game[]): MyGameStatisticViewDto {
    const dto = new MyGameStatisticViewDto();
    // В текущей модели `Game` не содержит данных, достаточных
    // чтобы вычислить победителя/поражение без `userId`.
    // Поэтому используем заглушку. Основная логика статистики —
    // в query-handler `get-games-statistics`.
    dto.gamesCount = myGames.length;
    dto.sumScore = 0;
    dto.avgScores = 0;
    dto.winsCount = 0;
    dto.lossesCount = 0;
    dto.drawsCount = 0;
    return dto;
  }
}
