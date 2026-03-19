import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../domain/player.entity';
import { Repository } from 'typeorm';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';

export class PlayerRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async findByUserIdOrNotFoundFail(userId: string): Promise<Player> {
    const player = await this.playerRepository
      .createQueryBuilder('player')
      .where('player.playerAccount.id = :userId', { userId })
      .getOne();

    if (!player) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Player not found',
      });
    }
    return player;
  }

  async findManyByUserId(userId: string): Promise<Player[]> {
    return await this.playerRepository
      .createQueryBuilder('player')
      .where('player.playerAccount.id = :userId', { userId })
      .getMany();
  }

  async findByIdOrNotFoundFail(id: string): Promise<Player> {
    const player = await this.playerRepository.findOne({ where: { id } });

    if (!player) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Player not found',
      });
    }
    return player;
  }

  async save(player: Player): Promise<void> {
    await this.playerRepository.save(player);
  }
}
