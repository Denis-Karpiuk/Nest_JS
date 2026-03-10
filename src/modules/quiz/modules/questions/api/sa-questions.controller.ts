import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from 'src/core/guards/basic-auth.guard';
import { CreateQuestionInputDto } from './input-dto/create-question.input.dto';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetQuestionByIdQuery } from '../application/queries/get-question-by-id.query-handler';
import { Question } from '../domain/question.entity';

@Controller('sa/quiz/questions')
export class SaQuestionsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createQuestion(@Body() dto: CreateQuestionInputDto) {
    const questionId = await this.commandBus.execute<
      CreateQuestionCommand,
      string
    >(new CreateQuestionCommand(dto));

    return this.queryBus.execute<GetQuestionByIdQuery, Question>(
      new GetQuestionByIdQuery(questionId),
    );
  }
}
