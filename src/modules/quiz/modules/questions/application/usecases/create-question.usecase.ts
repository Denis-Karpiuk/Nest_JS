import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../../domain/dto/create-question.dto';
import { Question } from '../../domain/question.entity';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class CreateQuestionCommand {
  constructor(public readonly dto: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    const question = Question.createInstance(command.dto);

    await this.questionsRepository.save(question);

    return question.id;
  }
}
