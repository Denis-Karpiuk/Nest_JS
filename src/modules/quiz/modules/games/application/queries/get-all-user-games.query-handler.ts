import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetAllGamesQueryParamsDto } from '../../api/input-dto/get-all-games-query.input-dto';
import { AnswerViewDto } from '../../api/view-dto/answer.view-dto';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { Answer } from '../../domain/answer.entity';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameQuestionQueryRepository } from '../../infrastructure/game.question.query.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';

export class GetAllUserGamesQuery {
  constructor(
    public readonly query: GetAllGamesQueryParamsDto,
    public readonly userId: string,
  ) {}
}

@QueryHandler(GetAllUserGamesQuery)
export class GetAllUserGamesQueryHandler implements IQueryHandler<GetAllUserGamesQuery> {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly gameQuestionQueryRepository: GameQuestionQueryRepository,
  ) {}

  async execute({
    query,
    userId,
  }: GetAllUserGamesQuery): Promise<PaginatedViewDto<GameViewDto[]>> {
    const players = await this.playerRepository.findManyByUserId(userId);

    const playerIds: string[] = players.map((player) => player.id);

    const { games, totalCount } =
      await this.gameQueryRepository.getAllGamesByPlayerIds(playerIds, query);

    const answers: Answer[] = playerIds.length
      ? await this.answerRepository.findByPlayerIds(playerIds)
      : [];

    const gameIds = games.map((game) => game.id);

    const gameQuestions =
      await this.gameQuestionQueryRepository.findManyByGameIds(gameIds);

    const items = games.map((game) => {
      const questions = gameQuestions
        .filter((gq) => gq.game.id === game.id)
        .map((gq) => gq.question);

      const questionIds = new Set(questions.map((q) => q.id));

      const firstPlayerAnswers: AnswerViewDto[] = answers
        .filter(
          (a) =>
            a.playerId === game.firstPlayer.id && questionIds.has(a.questionId),
        )
        .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
        .map(AnswerViewDto.mapToView);

      const secondPlayerAnswers: AnswerViewDto[] = game.secondPlayer
        ? answers
            .filter(
              (a) =>
                a.playerId === game.secondPlayer!.id &&
                questionIds.has(a.questionId),
            )
            .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
            .map(AnswerViewDto.mapToView)
        : [];

      return GameViewDto.mapToView(
        game,
        questions,
        firstPlayerAnswers,
        secondPlayerAnswers,
      );
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
