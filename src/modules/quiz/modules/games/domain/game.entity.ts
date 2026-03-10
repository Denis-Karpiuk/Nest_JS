import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerProgress } from './player-progress.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @OneToOne(() => PlayerProgress)
  @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress)
  @JoinColumn()
  secondPlayerProgress: PlayerProgress;

  @Column('int', { array: true })
  questions: string[];
}
