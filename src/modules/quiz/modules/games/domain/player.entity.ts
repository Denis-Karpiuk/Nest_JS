import { User } from 'src/modules/users-accounts/domain/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => User)
  playerAccount: User;

  @Column({ default: 0 })
  score: number;

  static createInstance(dto: CreatePlayerDto): Player {
    const player = new this();
    player.playerAccount = { id: dto.playerId } as User;

    return player;
  }
}
