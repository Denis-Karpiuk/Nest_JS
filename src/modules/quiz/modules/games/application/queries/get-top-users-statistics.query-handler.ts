import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { TopUsersViewDto } from '../../api/view-dto/top-users.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetTopUsersQueryParamsDto } from '../../api/input-dto/get-top-users-query.input-dto';

export class GetTopUsersStatisticsQuery {
  constructor(public readonly params: GetTopUsersQueryParamsDto) {}
}

@QueryHandler(GetTopUsersStatisticsQuery)
export class GetTopUsersStatisticsQueryHandler implements IQueryHandler<GetTopUsersStatisticsQuery> {
  constructor(private readonly gameQueryRepository: GameQueryRepository) {}

  async execute({
    params,
  }: GetTopUsersStatisticsQuery): Promise<PaginatedViewDto<TopUsersViewDto[]>> {
    const finishedGames = await this.gameQueryRepository.getAllFinishedGames();

    type SortField = keyof Pick<
      TopUsersViewDto,
      | 'sumScore'
      | 'avgScores'
      | 'gamesCount'
      | 'winsCount'
      | 'lossesCount'
      | 'drawsCount'
    >;
    type SortCriterion = { field: SortField; direction: 'asc' | 'desc' };

    const DEFAULT_CRITERIA: SortCriterion[] = [
      { field: 'avgScores', direction: 'desc' },
      { field: 'sumScore', direction: 'desc' },
    ];

    const allowedFields: SortField[] = [
      'sumScore',
      'avgScores',
      'gamesCount',
      'winsCount',
      'lossesCount',
      'drawsCount',
    ];
    const allowedFieldsSet = new Set<SortField>(allowedFields);

    const sortItems = params.sort ?? [];
    const criteria: SortCriterion[] = sortItems.length
      ? sortItems
          .map((item) => {
            const parts = String(item).trim().split(/\s+/);
            if (parts.length < 2) return null;

            const direction = parts[parts.length - 1].toLowerCase();
            const fieldCandidate = parts[parts.length - 2];

            if (direction !== 'asc' && direction !== 'desc') return null;
            const field = fieldCandidate as SortField;
            if (!allowedFieldsSet.has(field)) return null;

            return { field, direction } satisfies SortCriterion;
          })
          .filter((v): v is SortCriterion => v !== null)
      : DEFAULT_CRITERIA;

    const statsByPlayerId = new Map<
      string,
      {
        player: { id: string; login: string };
        sumScore: number;
        gamesCount: number;
        winsCount: number;
        lossesCount: number;
        drawsCount: number;
      }
    >();

    for (const game of finishedGames) {
      const first = game.firstPlayer;
      const second = game.secondPlayer;
      if (!first || !second) continue;

      const firstId = first.playerAccount.id;
      const secondId = second.playerAccount.id;

      const getOrCreate = (playerId: string, login: string) => {
        const existing = statsByPlayerId.get(playerId);
        if (existing) return existing;
        const created = {
          player: { id: playerId, login },
          sumScore: 0,
          gamesCount: 0,
          winsCount: 0,
          lossesCount: 0,
          drawsCount: 0,
        };
        statsByPlayerId.set(playerId, created);
        return created;
      };

      const firstAcc = getOrCreate(firstId, first.playerAccount.login);
      const secondAcc = getOrCreate(secondId, second.playerAccount.login);

      firstAcc.gamesCount += 1;
      firstAcc.sumScore += first.score;
      secondAcc.gamesCount += 1;
      secondAcc.sumScore += second.score;

      if (first.score > second.score) firstAcc.winsCount += 1;
      else if (first.score < second.score) firstAcc.lossesCount += 1;
      else firstAcc.drawsCount += 1;

      if (second.score > first.score) secondAcc.winsCount += 1;
      else if (second.score < first.score) secondAcc.lossesCount += 1;
      else secondAcc.drawsCount += 1;
    }

    const itemsAll = Array.from(statsByPlayerId.values()).map((acc) => {
      const avgScores = acc.gamesCount ? acc.sumScore / acc.gamesCount : 0;
      const roundedAvgScores = Math.round(avgScores * 100) / 100;

      return TopUsersViewDto.mapToView({
        player: acc.player,
        sumScore: acc.sumScore,
        avgScores: roundedAvgScores,
        gamesCount: acc.gamesCount,
        winsCount: acc.winsCount,
        lossesCount: acc.lossesCount,
        drawsCount: acc.drawsCount,
      });
    });

    itemsAll.sort((a, b) => {
      for (const c of criteria) {
        const dirMul = c.direction === 'asc' ? 1 : -1;
        const av = a[c.field];
        const bv = b[c.field];
        if (av === bv) continue;
        return av < bv ? -1 * dirMul : 1 * dirMul;
      }
      // tie-break for deterministic output
      return a.player.id.localeCompare(b.player.id);
    });

    const totalCount = itemsAll.length;
    const start = params.calculateSkip();
    const end = start + params.pageSize;
    const items = itemsAll.slice(start, end);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: params.pageNumber,
      size: params.pageSize,
    });
  }
}
