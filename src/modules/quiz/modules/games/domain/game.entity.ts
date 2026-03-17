import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { AddSecondPlayerDto } from './dto/add-second-player.dto';
import { CreateGameDto, GameStatus } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Player } from './player.entity';
import { GameQuestion } from './game-question.entity';

@Entity()
export class Game {
  @PrimaryColumn('uuid')
  public id: string;

  @OneToOne(() => Player)
  @JoinColumn()
  firstPlayer: Player;

  @OneToOne(() => Player)
  @JoinColumn()
  secondPlayer: Player | null;

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
  questions: GameQuestion[];

  @Column()
  status: GameStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  finishDate: Date | null;

  static createInstance(dto: CreateGameDto) {
    const game = new this();

    game.id = dto.id;
    game.firstPlayer = { id: dto.playerId } as Player;
    game.status = GameStatus.PendingSecondPlayer;

    return game;
  }

  addSecondPlayer(dto: AddSecondPlayerDto) {
    this.secondPlayer = {
      id: dto.playerId,
    } as Player;

    this.startDate = new Date();
    this.status = GameStatus.Active;
  }

  updateStatus(dto: UpdateGameDto) {
    this.status = dto.status;
  }
}
