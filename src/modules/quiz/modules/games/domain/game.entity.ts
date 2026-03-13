import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerProgress } from './player-progress.entity';
import {
  CreateGameDto,
  GameQuestionItem,
  GameStatus,
} from './dto/create-game.dto';
import { AddSecondPlayerDto } from './dto/add-second-player.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: true })
  firstPlayerProgressId: string;

  @OneToOne(() => PlayerProgress)
  @JoinColumn({ name: 'firstPlayerProgressId', referencedColumnName: 'id' })
  firstPlayerProgress: PlayerProgress;

  @Column({ nullable: true })
  secondPlayerProgressId: string | null;

  @OneToOne(() => PlayerProgress)
  @JoinColumn({ name: 'secondPlayerProgressId', referencedColumnName: 'id' })
  secondPlayerProgress: PlayerProgress | null;

  @Column({ type: 'jsonb', default: [] })
  questions: GameQuestionItem[];

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

    game.firstPlayerProgressId = dto.firstPlayerProgressId;
    game.questions = dto.questions;
    game.status = GameStatus.PendingSecondPlayer;

    return game;
  }

  addSecondPlayer(dto: AddSecondPlayerDto) {
    this.secondPlayerProgressId = dto.playerId;
    this.status = GameStatus.Active;
  }

  updateStatus(dto: UpdateGameDto) {
    this.status = dto.status;
  }
}
