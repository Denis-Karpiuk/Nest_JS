import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
  Put,
} from '@nestjs/common';
import { BasicAuthGuard } from 'src/core/guards/basic-auth.guard';
import { CreateQuestionInputDto } from './input-dto/create-question.input.dto';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetQuestionByIdQuery } from '../application/queries/get-question-by-id.query-handler';
import { Question } from '../domain/question.entity';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { UpdateQuestionInputDto } from './input-dto/create-question.input.dto';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { PublishQuestionInputDto } from './input-dto/publish-question.input.dto';
import { PublishQuestionCommand } from '../application/usecases/publish-question.usecase';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class SaQuestionsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string) {
    await this.commandBus.execute<DeleteQuestionCommand, void>(
      new DeleteQuestionCommand(id),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionInputDto,
  ) {
    await this.commandBus.execute<UpdateQuestionCommand, void>(
      new UpdateQuestionCommand(id, dto),
    );
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param('id') id: string,
    @Body() dto: PublishQuestionInputDto,
  ) {
    await this.commandBus.execute<PublishQuestionCommand, void>(
      new PublishQuestionCommand(id, dto),
    );
  }
}
