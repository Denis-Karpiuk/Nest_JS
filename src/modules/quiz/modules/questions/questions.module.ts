import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { SaQuestionsController } from './api/sa-questions.controller';
import { CreateQuestionUseCase } from './application/usecases/create-question.usecase';
import { QuestionsQueryRepository } from './infrastructure/question.query-repository';
import { GetQuestionByIdQueryHandler } from './application/queries/get-question-by-id.query-handler';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { DeleteQuestionUseCase } from './application/usecases/delete-question.usecase';
import { UpdateQuestionUseCase } from './application/usecases/update-question.usecase';

const commandHandlers = [
  CreateQuestionUseCase,
  DeleteQuestionUseCase,
  UpdateQuestionUseCase,
];
const queryHandlers = [GetQuestionByIdQueryHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    QuestionsRepository,
    QuestionsQueryRepository,
  ],
  controllers: [SaQuestionsController],
})
export class QuestionsModule {}
