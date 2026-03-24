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
import { Game } from '../../domain/game.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { GameStatus } from '../../domain/dto/create-game.dto';

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
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private static readonly ANSWER_TIMEOUT_MS = 10_000;

  private getTimeoutJobName(gameId: string): string {
    return `pair-game-quiz:finish-timeout:${gameId}`;
  }

  private cancelGameTimeout(gameId: string): void {
    const name = this.getTimeoutJobName(gameId);
    if (this.schedulerRegistry.doesExist('timeout', name)) {
      this.schedulerRegistry.deleteTimeout(name);
    }
  }

  private scheduleGameTimeout(params: {
    gameId: string;
    waitingPlayerId: string;
    remainingMs: number;
    gameQuestionIdList: string[];
    questionsCount: number;
  }): void {
    const {
      gameId,
      waitingPlayerId,
      remainingMs,
      gameQuestionIdList,
      questionsCount,
    } = params;

    const name = this.getTimeoutJobName(gameId);
    if (this.schedulerRegistry.doesExist('timeout', name)) {
      this.schedulerRegistry.deleteTimeout(name);
    }

    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      void this.finalizeTimeoutGame({
        gameId,
        waitingPlayerId,
        gameQuestionIdList,
        questionsCount,
      });
    }, remainingMs);

    this.schedulerRegistry.addTimeout(name, timeoutId);
  }

  private async awardSpeedBonusAndFinishGame(
    game: Game,
    firstPlayerGameAnswers: Answer[],
    secondPlayerGameAnswers: Answer[],
  ): Promise<void> {
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
  }

  private async finalizeTimeoutGame(params: {
    gameId: string;
    waitingPlayerId: string;
    gameQuestionIdList: string[];
    questionsCount: number;
  }): Promise<void> {
    const { gameId, waitingPlayerId, gameQuestionIdList, questionsCount } =
      params;

    // Ensure this timeout job is removed from the registry.
    this.cancelGameTimeout(gameId);

    const game = await this.gameQueryRepository.getByIdOrNotFoundFail(gameId);
    if (game.status !== GameStatus.Active) return;
    if (!game.secondPlayer) return;

    const gameQuestionIdSet = new Set(gameQuestionIdList);

    const firstPlayerAnswers = (
      await this.answerRepository.findByPlayerId(game.firstPlayer.id)
    ).filter((a) => gameQuestionIdSet.has(a.questionId));

    const secondPlayerAnswers = (
      await this.answerRepository.findByPlayerId(game.secondPlayer.id)
    ).filter((a) => gameQuestionIdSet.has(a.questionId));

    const waitingAnswers =
      waitingPlayerId === game.firstPlayer.id
        ? firstPlayerAnswers
        : secondPlayerAnswers;

    // If waiting player already completed within time, ignore timeout.
    if (waitingAnswers.length === questionsCount) return;

    const answeredQuestionIds = new Set(
      waitingAnswers.map((a) => a.questionId),
    );
    const missingQuestionIds = gameQuestionIdList.filter(
      (questionId) => !answeredQuestionIds.has(questionId),
    );

    for (const questionId of missingQuestionIds) {
      await this.answerRepository.save(
        Answer.createInstance({
          questionId,
          playerId: waitingPlayerId,
          answer: '__TIMEOUT__',
          answerStatus: AnswerStatus.Incorrect,
        }),
      );
    }

    // Re-fetch answers after inserting timeout incorrect answers.
    const firstPlayerGameAnswersAfter = (
      await this.answerRepository.findByPlayerId(game.firstPlayer.id)
    ).filter((a) => gameQuestionIdSet.has(a.questionId));

    const secondPlayerGameAnswersAfter = (
      await this.answerRepository.findByPlayerId(game.secondPlayer.id)
    ).filter((a) => gameQuestionIdSet.has(a.questionId));

    // Now both players should be finished; we can safely apply the existing bonus logic.
    await this.awardSpeedBonusAndFinishGame(
      game,
      firstPlayerGameAnswersAfter,
      secondPlayerGameAnswersAfter,
    );
  }

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
    const gameQuestionIdList = Array.from(gameQuestionIds);
    const questionsCount = gameQuestions.length;
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

    // Timeout pre-check: if the other player already finished all questions,
    // the current player has ANSWER_TIMEOUT_MS to finish too.
    const otherPlayer =
      player.id === game.firstPlayer.id ? game.secondPlayer : game.firstPlayer;

    if (!otherPlayer) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not in an active pair',
      });
    }

    const otherPlayerAnswers = await this.answerRepository.findByPlayerId(
      otherPlayer.id,
    );

    const otherPlayerGameAnswers = otherPlayerAnswers.filter((a) =>
      gameQuestionIds.has(a.questionId),
    );

    const otherPlayerFinished =
      otherPlayerGameAnswers.length === questionsCount;
    if (otherPlayerFinished) {
      const otherPlayerLastAnswerAt = otherPlayerGameAnswers.reduce(
        (latest, current) =>
          current.addedAt > latest ? current.addedAt : latest,
        otherPlayerGameAnswers[0].addedAt,
      );

      const elapsedMs = Date.now() - otherPlayerLastAnswerAt.getTime();
      const remainingMs = AddAnswerCommandUseCase.ANSWER_TIMEOUT_MS - elapsedMs;

      if (remainingMs <= 0) {
        this.cancelGameTimeout(game.id);
        await this.finalizeTimeoutGame({
          gameId: game.id,
          waitingPlayerId: player.id,
          gameQuestionIdList,
          questionsCount,
        });

        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: 'Time is up: unanswered questions are counted as Incorrect',
          extensions: [
            {
              field: 'answers',
              message:
                'Time is up: unanswered questions are counted as Incorrect',
            },
          ],
        });
      }

      this.scheduleGameTimeout({
        gameId: game.id,
        waitingPlayerId: player.id,
        remainingMs,
        gameQuestionIdList,
        questionsCount,
      });
    }

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

    const firstPlayerFinished =
      firstPlayerGameAnswers.length === questionsCount;

    const secondPlayerFinished =
      secondPlayerGameAnswers.length === questionsCount;

    const bothPlayersFinished = firstPlayerFinished && secondPlayerFinished;

    if (bothPlayersFinished) {
      this.cancelGameTimeout(game.id);
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
    } else if (firstPlayerFinished && !secondPlayerFinished) {
      const finisherLastAnswerAt = firstPlayerGameAnswers.reduce(
        (latest, current) =>
          current.addedAt > latest ? current.addedAt : latest,
        firstPlayerGameAnswers[0].addedAt,
      );

      const elapsedMs = Date.now() - finisherLastAnswerAt.getTime();
      const remainingMs = AddAnswerCommandUseCase.ANSWER_TIMEOUT_MS - elapsedMs;

      if (remainingMs <= 0) {
        this.cancelGameTimeout(game.id);
        await this.finalizeTimeoutGame({
          gameId: game.id,
          waitingPlayerId: game.secondPlayer!.id,
          gameQuestionIdList,
          questionsCount,
        });
      } else {
        this.scheduleGameTimeout({
          gameId: game.id,
          waitingPlayerId: game.secondPlayer!.id,
          remainingMs,
          gameQuestionIdList,
          questionsCount,
        });
      }
    } else if (!firstPlayerFinished && secondPlayerFinished) {
      const finisherLastAnswerAt = secondPlayerGameAnswers.reduce(
        (latest, current) =>
          current.addedAt > latest ? current.addedAt : latest,
        secondPlayerGameAnswers[0].addedAt,
      );

      const elapsedMs = Date.now() - finisherLastAnswerAt.getTime();
      const remainingMs = AddAnswerCommandUseCase.ANSWER_TIMEOUT_MS - elapsedMs;

      if (remainingMs <= 0) {
        this.cancelGameTimeout(game.id);
        await this.finalizeTimeoutGame({
          gameId: game.id,
          waitingPlayerId: game.firstPlayer.id,
          gameQuestionIdList,
          questionsCount,
        });
      } else {
        this.scheduleGameTimeout({
          gameId: game.id,
          waitingPlayerId: game.firstPlayer.id,
          remainingMs,
          gameQuestionIdList,
          questionsCount,
        });
      }
    }

    return AnswerViewDto.mapToView(savedAnswer);
  }
}
