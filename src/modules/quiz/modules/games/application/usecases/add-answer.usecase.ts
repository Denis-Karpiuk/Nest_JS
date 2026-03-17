import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { AddAnswerInputDto } from '../../api/input-dto/add-answer.input.dto';
import { AnswerViewDto } from '../../api/view-dto/answer.view-dto';
import { Answer } from '../../domain/answer.entity';
import { AnswerStatus } from '../../domain/dto/create-answer.dto';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { GameQuestionRepository } from '../../infrastructure/game.question.repository';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';

export class AddAnswerCommand {
  constructor(public readonly dto: AddAnswerInputDto) {}
}

@CommandHandler(AddAnswerCommand)
export class AddAnswerCommandUseCase implements ICommandHandler<AddAnswerCommand> {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly gameQuestionRepository: GameQuestionRepository,
  ) {}

  async execute({ dto }: AddAnswerCommand): Promise<AnswerViewDto> {
    const player = await this.playerRepository.findByUserIdOrNotFoundFail(
      dto.userId,
    );

    const game = await this.gameRepository.findByPlayerIdOrNotFoundFail(
      player.id,
    );

    const answers = await this.answerRepository.findByPlayerId(player.id);

    const gameQuestions =
      await this.gameQuestionRepository.findByGameIdOrNotFoundFail(game.id);

    if (answers.length === gameQuestions.length) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'All questions answered',
        extensions: [
          {
            field: 'answers',
            message: 'All questions answered',
          },
        ],
      });
    }

    const questionIndex = answers.length;

    const isCorrect = gameQuestions[
      questionIndex
    ].question.correctAnswers.includes(dto.answer);

    const answer = Answer.createInstance({
      questionId: gameQuestions[questionIndex].question.id,
      playerId: player.id,
      answer: dto.answer,
      answerStatus: isCorrect ? AnswerStatus.Correct : AnswerStatus.Incorrect,
    });

    await this.answerRepository.save(answer);

    const savedAnswer =
      await this.answerRepository.findByQuestionIdOrNotFoundFail(
        answer.questionId,
      );

    return AnswerViewDto.mapToView(savedAnswer);
  }
}
