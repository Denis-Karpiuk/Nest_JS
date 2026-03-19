import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetAllGamesQueryParamsDto } from '../../api/input-dto/get-all-games-query.input-dto';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { AnswerViewDto } from '../../api/view-dto/answer.view-dto';
import { GameQuestion } from '../../domain/game-question.entity';
import { Question } from '../../../questions/domain/question.entity';
import { Answer } from '../../domain/answer.entity';

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
  ) {}

  async execute({
    query,
    userId,
  }: GetAllUserGamesQuery): Promise<PaginatedViewDto<GameViewDto[]>> {
    const { games, totalCount } = await this.gameQueryRepository.getAllGames(
      query,
      userId,
    );

    const playerIds: string[] = games
      .flatMap((game) => [
        game.firstPlayer.id,
        ...(game.secondPlayer ? [game.secondPlayer.id] : []),
      ])
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    const answers: Answer[] = playerIds.length
      ? await this.answerRepository.findByPlayerIds(playerIds)
      : [];

    const items = games.map((game) => {
      const questions: Question[] = (game.questions ?? []).map(
        (gq: GameQuestion) => gq.question,
      );
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
