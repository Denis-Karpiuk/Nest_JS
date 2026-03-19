import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { AnswerStatus, CreateAnswerDto } from './dto/create-answer.dto';

@Entity()
export class Answer {
  @PrimaryColumn('uuid')
  public questionId: string;

  @PrimaryColumn('uuid')
  public playerId: string;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Column()
  answer: string;

  @CreateDateColumn()
  addedAt: Date;

  @Column({ type: 'enum', enum: AnswerStatus })
  answerStatus: AnswerStatus;

  static createInstance(dto: CreateAnswerDto): Answer {
    const answer = new this();

    answer.questionId = dto.questionId;
    answer.playerId = dto.playerId;
    answer.player = { id: dto.playerId } as Player;
    answer.answer = dto.answer;
    answer.answerStatus = dto.answerStatus;

    return answer;
  }
}
