import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PublishQuestionDto } from './dto/publish-question.dto';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  body: string;

  @Column('text', { array: true })
  correctAnswers: string[];

  @Column()
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  static createInstance(dto: CreateQuestionDto): Question {
    const question = new this();

    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.published = false;

    return question;
  }
  update(dto: CreateQuestionDto) {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
    this.updatedAt = new Date();
  }

  publish(dto: PublishQuestionDto) {
    this.published = dto.published;
    this.updatedAt = new Date();
  }
}
