import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateQuestionInputDto } from '../../api/input-dto/create-question.input.dto';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class UpdateQuestionCommand {
  constructor(
    public readonly questionId: string,
    public readonly dto: UpdateQuestionInputDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findByIdOrNotFoundFail(
      command.questionId,
    );

    question.update(command.dto);

    await this.questionsRepository.save(question);
  }
}
