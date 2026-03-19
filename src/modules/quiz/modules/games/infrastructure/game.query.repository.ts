import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Repository } from 'typeorm';
import { GameStatus } from '../domain/dto/create-game.dto';
import { Game } from '../domain/game.entity';
import { GetAllGamesQueryParamsDto } from '../api/input-dto/get-all-games-query.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<Game> {
    const game = await this.gamesRepository.findOne({
      where: { id },
      relations: {
        firstPlayer: { playerAccount: true },
        secondPlayer: { playerAccount: true },
        questions: { question: true },
      },
    });

    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game not found',
        extensions: [
          {
            field: 'gameId',
            message: 'Game not found',
          },
        ],
      });
    }

    return game;
  }

  async getGameByPlayerId(playerId: string): Promise<Game | null> {
    return await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayer', 'firstPlayer')
      .leftJoinAndSelect('firstPlayer.playerAccount', 'firstPlayerAccount')
      .leftJoinAndSelect('game.secondPlayer', 'secondPlayer')
      .leftJoinAndSelect('secondPlayer.playerAccount', 'secondPlayerAccount')
      .where('game.firstPlayerId = :playerId', { playerId })
      .orWhere('game.secondPlayerId = :playerId', { playerId })
      .getOne();
  }

  async findActiveOrPendingGameByUserId(userId: string): Promise<Game | null> {
    return await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayer', 'firstPlayer')
      .leftJoinAndSelect('firstPlayer.playerAccount', 'fpAccount')
      .leftJoinAndSelect('game.secondPlayer', 'secondPlayer')
      .leftJoinAndSelect('secondPlayer.playerAccount', 'spAccount')
      .where('game.status IN (:...statuses)', {
        statuses: [GameStatus.Active, GameStatus.PendingSecondPlayer],
      })
      .andWhere('(fpAccount.id = :userId OR spAccount.id = :userId)', {
        userId,
      })
      .getOne();
  }

  async findActiveGameByUserId(userId: string): Promise<Game | null> {
    return await this.gamesRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayer', 'firstPlayer')
      .leftJoinAndSelect('firstPlayer.playerAccount', 'fpAccount')
      .leftJoinAndSelect('game.secondPlayer', 'secondPlayer')
      .leftJoinAndSelect('secondPlayer.playerAccount', 'spAccount')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'question')
      .where('game.status = :status', { status: GameStatus.Active })
      .andWhere('(fpAccount.id = :userId OR spAccount.id = :userId)', {
        userId,
      })
      .getOne();
  }

  async getAllGamesByPlayerIds(
    playerIds: string[],
    query: GetAllGamesQueryParamsDto,
  ): Promise<{ games: Game[]; totalCount: number }> {
    const qb = this.gamesRepository
      .createQueryBuilder('games')
      .where(
        'games.firstPlayerId IN (:...playerIds) OR games.secondPlayerId IN (:...playerIds)',
        { playerIds },
      )
      .leftJoinAndSelect('games.firstPlayer', 'firstPlayer')
      .leftJoinAndSelect('firstPlayer.playerAccount', 'fpAccount')
      .leftJoinAndSelect('games.secondPlayer', 'secondPlayer')
      .leftJoinAndSelect('secondPlayer.playerAccount', 'spAccount')

      .skip(query.calculateSkip())
      .take(query.pageSize);

    const sortDir = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';
    // sortBy is either `createdAt` or `status` (see PairSortBy enum)
    qb.orderBy(`games.${query.sortBy}`, sortDir);

    // Для стабильности результата при сортировке по status
    // (когда несколько игр имеют одинаковый status) — доп. сортируем по времени создания.
    qb.addOrderBy('games.createdAt', 'DESC');

    const [games, totalCount] = await qb.getManyAndCount();

    return { games, totalCount };
  }

  async getAllPaginatedGames(
    query: GetAllGamesQueryParamsDto,
    userId: string,
  ): Promise<{ games: Game[]; totalCount: number }> {
    const qb = this.gamesRepository
      .createQueryBuilder('games')
      .leftJoinAndSelect('games.firstPlayer', 'firstPlayer')
      .leftJoinAndSelect('firstPlayer.playerAccount', 'fpAccount')
      .leftJoinAndSelect('games.secondPlayer', 'secondPlayer')
      .leftJoinAndSelect('secondPlayer.playerAccount', 'spAccount')
      .leftJoinAndSelect('games.questions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'question')
      .where('(fpAccount.id = :userId OR spAccount.id = :userId)', { userId })
      .andWhere('games.status IN (:...statuses)', {
        statuses: [
          GameStatus.Active,
          GameStatus.PendingSecondPlayer,
          GameStatus.Finished,
        ],
      })
      .skip(query.calculateSkip())
      .take(query.pageSize);

    const sortDir = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';
    // sortBy is either `createdAt` or `status` (see PairSortBy enum)
    qb.orderBy(`games.${query.sortBy}`, sortDir);

    // Для стабильности результата при сортировке по status
    // (когда несколько игр имеют одинаковый status) — доп. сортируем по времени создания.
    qb.addOrderBy('games.createdAt', 'DESC');

    // Чтобы порядок `game.questions[]` был детерминированным для тестов.
    qb.addOrderBy('gameQuestions.id', 'ASC');

    const [games, totalCount] = await qb.getManyAndCount();
    return { games, totalCount };
  }

  getFinishedGamesByUserId(userId: string): Promise<Game[]> {
    return this.gamesRepository
      .createQueryBuilder('games')
      .leftJoinAndSelect('games.firstPlayer', 'firstPlayer')
      .leftJoinAndSelect('firstPlayer.playerAccount', 'fpAccount')
      .leftJoinAndSelect('games.secondPlayer', 'secondPlayer')
      .leftJoinAndSelect('secondPlayer.playerAccount', 'spAccount')
      .where('(fpAccount.id = :userId OR spAccount.id = :userId)', { userId })
      .andWhere('games.status = :status', { status: GameStatus.Finished })
      .getMany();
  }
}
