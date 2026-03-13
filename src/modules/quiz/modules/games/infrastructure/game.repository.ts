import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Repository } from 'typeorm';
import { Game } from '../domain/game.entity';
import { GameStatus } from '../domain/dto/create-game.dto';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async findByIdOrNotFoundFail(id: string): Promise<Game> {
    const game = await this.gamesRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
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

  async findGamyByStatus(status: GameStatus): Promise<Game | null> {
    return await this.gamesRepository
      .createQueryBuilder('b')
      .where('b.status = :status', { status })
      .getOne();
  }

  save(game: Game) {
    return this.gamesRepository.save(game);
  }
}
