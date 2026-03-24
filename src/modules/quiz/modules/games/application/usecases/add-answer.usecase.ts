import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { AddAnswerInputDto } from '../../api/input-dto/add-answer.input.dto';
import { AnswerViewDto } from '../../api/view-dto/answer.view-dto';
import { Answer } from '../../domain/answer.entity';
import { AnswerStatus } from '../../domain/dto/create-answer.dto';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameQuestionRepository } from '../../infrastructure/game.question.repository';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { GameTimeoutService } from '../services/game-timeout.service';

export class AddAnswerCommand {
  constructor(public readonly dto: AddAnswerInputDto) {}
}

@CommandHandler(AddAnswerCommand)
export class AddAnswerCommandUseCase implements ICommandHandler<AddAnswerCommand> {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameRepository: GameRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly gameQuestionRepository: GameQuestionRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly gameTimeoutService: GameTimeoutService,
  ) {}

  async execute({ dto }: AddAnswerCommand): Promise<AnswerViewDto> {
    const game = await this.gameQueryRepository.findActiveGameByUserId(
      dto.userId,
    );

    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not in an active pair',
        extensions: [
          {
            field: 'answers',
            message: 'You are not in an active pair',
          },
        ],
      });
    }

    const player =
      game.firstPlayer?.playerAccount?.id === dto.userId
        ? game.firstPlayer
        : game.secondPlayer;

    if (!player) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not in an active pair',
        extensions: [
          { field: 'answers', message: 'You are not in an active pair' },
        ],
      });
    }

    const gameQuestions =
      await this.gameQuestionRepository.findByGameIdOrNotFoundFail(game.id);

    const gameQuestionIds = new Set(gameQuestions.map((gq) => gq.question.id));
    const allAnswers = await this.answerRepository.findByPlayerId(player.id);
    const answers = allAnswers
      .filter((a) => gameQuestionIds.has(a.questionId))
      .sort(
        (a, b) =>
          gameQuestions.findIndex((gq) => gq.question.id === a.questionId) -
          gameQuestions.findIndex((gq) => gq.question.id === b.questionId),
      );

    if (answers.length >= gameQuestions.length) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'All questions already answered',
        extensions: [
          {
            field: 'answers',
            message: 'All questions already answered',
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

    const savedAnswer = await this.answerRepository.save(answer);
    if (isCorrect) {
      player.score += 1;
      await this.playerRepository.save(player);
    }

    const firstPlayerAnswers = await this.answerRepository.findByPlayerId(
      game.firstPlayer.id,
    );
    const secondPlayerAnswers = game.secondPlayer
      ? await this.answerRepository.findByPlayerId(game.secondPlayer.id)
      : [];
    const firstPlayerGameAnswers = firstPlayerAnswers.filter((a) =>
      gameQuestionIds.has(a.questionId),
    );
    const secondPlayerGameAnswers = secondPlayerAnswers.filter((a) =>
      gameQuestionIds.has(a.questionId),
    );
    const questionsCount = gameQuestions.length;
    const bothPlayersFinished =
      firstPlayerGameAnswers.length === questionsCount &&
      secondPlayerGameAnswers.length === questionsCount;

    if (bothPlayersFinished) {
      this.gameTimeoutService.cancelTimeout(game.id);

      const firstPlayerLastAnswerAt = firstPlayerGameAnswers.reduce(
        (latest, current) =>
          current.addedAt > latest ? current.addedAt : latest,
        firstPlayerGameAnswers[0].addedAt,
      );
      const secondPlayerLastAnswerAt = secondPlayerGameAnswers.reduce(
        (latest, current) =>
          current.addedAt > latest ? current.addedAt : latest,
        secondPlayerGameAnswers[0].addedAt,
      );

      const firstPlayerHasCorrectAnswer = firstPlayerGameAnswers.some(
        (gameAnswer) => gameAnswer.answerStatus === AnswerStatus.Correct,
      );
      const secondPlayerHasCorrectAnswer = secondPlayerGameAnswers.some(
        (gameAnswer) => gameAnswer.answerStatus === AnswerStatus.Correct,
      );

      if (
        firstPlayerLastAnswerAt < secondPlayerLastAnswerAt &&
        firstPlayerHasCorrectAnswer
      ) {
        game.firstPlayer.score += 1;
        await this.playerRepository.save(game.firstPlayer);
      }

      if (
        secondPlayerLastAnswerAt < firstPlayerLastAnswerAt &&
        secondPlayerHasCorrectAnswer &&
        game.secondPlayer
      ) {
        game.secondPlayer.score += 1;
        await this.playerRepository.save(game.secondPlayer);
      }

      game.finishGame();
      await this.gameRepository.save(game);
    } else if (
      firstPlayerGameAnswers.length === questionsCount ||
      secondPlayerGameAnswers.length === questionsCount
    ) {
      this.gameTimeoutService.scheduleFinishIfNeeded(game.id);
    }

    return AnswerViewDto.mapToView(savedAnswer);
  }
}
