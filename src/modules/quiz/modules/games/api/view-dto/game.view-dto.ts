import { Game } from '../../domain/game.entity';
import { PlayerViewDto } from './player.view-dto';
import { QuestionViewDto } from './question.view-dto';
import { Question } from '../../../questions/domain/question.entity';
import { GameStatus } from '../../domain/dto/create-game.dto';
import { AnswerViewDto } from './answer.view-dto';

export class GameViewDto {
  id: string;
  firstPlayerProgress: PlayerViewDto;
  secondPlayerProgress: PlayerViewDto | null;
  questions: QuestionViewDto[] | null;
  status: string;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;

  static mapToView(
    game: Game,
    questions: Question[],
    firstPlayerAnswers: AnswerViewDto[] = [],
    secondPlayerAnswers: AnswerViewDto[] = [],
  ): GameViewDto {
    const dto = new GameViewDto();
    dto.id = game.id;
    dto.status = game.status;
    dto.pairCreatedDate = game.createdAt;
    dto.startGameDate = game.startDate ?? null;
    dto.finishGameDate = game.finishDate ?? null;
    dto.firstPlayerProgress = PlayerViewDto.mapToView(game.firstPlayer);
    dto.firstPlayerProgress.answers = firstPlayerAnswers;
    dto.secondPlayerProgress = game.secondPlayer
      ? PlayerViewDto.mapToView(game.secondPlayer)
      : null;
    if (dto.secondPlayerProgress) {
      dto.secondPlayerProgress.answers = secondPlayerAnswers;
    }
    dto.questions =
      game.status === GameStatus.PendingSecondPlayer
        ? null
        : (questions?.map(QuestionViewDto.mapToView) ?? []);

    return dto;
  }
}
