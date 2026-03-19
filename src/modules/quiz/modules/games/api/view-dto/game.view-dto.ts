import { Game } from '../../domain/game.entity';
import { PlayerViewDto } from './player.view-dto';
import { QuestionViewDto } from './question.view-dto';
import { Question } from '../../../questions/domain/question.entity';
import { GameStatus } from '../../domain/dto/create-game.dto';

export class GameViewDto {
  id: string;
  firstPlayerProgress: PlayerViewDto;
  secondPlayerProgress: PlayerViewDto | null;
  questions: QuestionViewDto[] | null;
  status: string;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;

  static mapToView(game: Game, questions: Question[]): GameViewDto {
    const dto = new GameViewDto();
    dto.id = game.id;
    dto.status = game.status;
    dto.pairCreatedDate = game.createdAt;
    dto.startGameDate = game.startDate ?? null;
    dto.finishGameDate = game.finishDate ?? null;
    dto.firstPlayerProgress = PlayerViewDto.mapToView(game.firstPlayer);
    dto.secondPlayerProgress = game.secondPlayer
      ? PlayerViewDto.mapToView(game.secondPlayer)
      : null;
    dto.questions =
      game.status === GameStatus.PendingSecondPlayer
        ? null
        : (questions?.map(QuestionViewDto.mapToView) ?? []);

    return dto;
  }
}
