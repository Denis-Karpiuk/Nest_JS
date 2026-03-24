import { Injectable, Logger } from '@nestjs/common';
import { AnswerStatus } from '../../domain/dto/create-answer.dto';
import { GameStatus } from '../../domain/dto/create-game.dto';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';

const GAME_FINISH_TIMEOUT_MS = 10_000;

@Injectable()
export class GameTimeoutService {
  private readonly logger = new Logger(GameTimeoutService.name);
  private readonly deadlines = new Map<string, number>();

  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}

  scheduleFinishIfNeeded(gameId: string): void {
    if (this.deadlines.has(gameId)) {
      return;
    }
    this.deadlines.set(gameId, Date.now() + GAME_FINISH_TIMEOUT_MS);
  }

  cancelTimeout(gameId: string): void {
    this.deadlines.delete(gameId);
  }

  async finishIfTimeoutExpired(gameId: string): Promise<void> {
    const deadline = this.deadlines.get(gameId);
    if (!deadline || Date.now() < deadline) {
      return;
    }

    try {
      await this.finishGameByTimeout(gameId);
    } catch (error) {
      this.logger.error(`Failed to finish game by timeout: ${gameId}`, error);
    } finally {
      this.cancelTimeout(gameId);
    }
  }

  private async finishGameByTimeout(gameId: string): Promise<void> {
    const game = await this.gameQueryRepository.getByIdOrNotFoundFail(gameId);

    if (game.status !== GameStatus.Active || !game.secondPlayer) {
      return;
    }

    const questionIds = new Set(game.questions.map((question) => question.question.id));
    const questionsCount = questionIds.size;

    const firstPlayerAnswers = (
      await this.answerRepository.findByPlayerId(game.firstPlayer.id)
    ).filter((answer) => questionIds.has(answer.questionId));
    const secondPlayerAnswers = (
      await this.answerRepository.findByPlayerId(game.secondPlayer.id)
    ).filter((answer) => questionIds.has(answer.questionId));

    const firstPlayerFinished = firstPlayerAnswers.length === questionsCount;
    const secondPlayerFinished = secondPlayerAnswers.length === questionsCount;

    if (firstPlayerFinished === secondPlayerFinished) {
      return;
    }

    const finishedPlayer = firstPlayerFinished ? game.firstPlayer : game.secondPlayer;
    const finishedPlayerAnswers = firstPlayerFinished
      ? firstPlayerAnswers
      : secondPlayerAnswers;
    const hasCorrectAnswer = finishedPlayerAnswers.some(
      (answer) => answer.answerStatus === AnswerStatus.Correct,
    );

    if (hasCorrectAnswer) {
      finishedPlayer.score += 1;
      await this.playerRepository.save(finishedPlayer);
    }

    game.finishGame();
    await this.gameRepository.save(game);
  }
}
