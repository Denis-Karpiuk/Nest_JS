import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PublishQuestionInputDto } from '../../api/input-dto/publish-question.input.dto';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class PublishQuestionCommand {
  constructor(
    public readonly questionId: string,
    public readonly dto: PublishQuestionInputDto,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<PublishQuestionCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: PublishQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findByIdOrNotFoundFail(
      command.questionId,
    );

    question.publish(command.dto);

    await this.questionsRepository.save(question);
  }
}
