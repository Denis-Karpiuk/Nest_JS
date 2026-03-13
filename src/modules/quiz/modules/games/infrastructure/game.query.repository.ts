import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Repository } from 'typeorm';
import { Game } from '../domain/game.entity';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<Game> {
    const game = await this.gamesRepository
      .createQueryBuilder('game')
      .where('game.id = :id', { id })
      .getOne();

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
      .where('game.firstPlayerProgressId = :playerId', { playerId })
      .orWhere('game.secondPlayerProgressId = :playerId', { playerId })
      .getOne();
  }

  // async getAllGames(
  //   query: GetGamesQueryParamsDto,
  // ): Promise<PaginatedViewDto<GameViewDto[]>> {
  //   const qb = this.gamesRepository
  //     .createQueryBuilder('question')
  //     .skip(query.calculateSkip())
  //     .take(query.pageSize);

  //   const bodySearchTerm = query.bodySearchTerm;
  //   if (bodySearchTerm) {
  //     qb.andWhere('question.body ILIKE :term', {
  //       term: `%${bodySearchTerm}%`,
  //     });
  //   }

  //   const publishedStatus = query.publishedStatus;
  //   if (publishedStatus === PublishedStatuses.Published) {
  //     qb.andWhere('question.published = :published', {
  //       published: true,
  //     });
  //   }

  //   if (publishedStatus === PublishedStatuses.NotPublished) {
  //     qb.andWhere('question.published = :published', {
  //       published: false,
  //     });
  //   }

  //   const sortDir = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';
  //   qb.orderBy(`question.${query.sortBy}`, sortDir);

  //   const [questions, totalCount] = await qb.getManyAndCount();
  //   const items = questions.map(QuestionViewDto.mapToView);

  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }
}
