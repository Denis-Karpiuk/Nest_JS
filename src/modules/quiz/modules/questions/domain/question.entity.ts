import { Column } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PublishQuestionDto } from './dto/publish-question.dto';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  body: string;

  @Column('text', { array: true })
  correctAnswers: string[];

  @Column()
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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
  }

  publish(dto: PublishQuestionDto) {
    this.published = dto.published;
  }
}
