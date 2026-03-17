import { Game } from '../../domain/game.entity';
import { PlayerViewDto } from './player.view-dto';
import { QuestionViewDto } from './question.view-dto';
import { Question } from '../../../questions/domain/question.entity';

export class GameViewDto {
  id: string;
  firstPlayerProgress: PlayerViewDto;
  secondPlayerProgress: PlayerViewDto | null;
  questions: QuestionViewDto[];
  status: string;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
  player: PlayerViewDto;

  static mapToView(game: Game, questions: Question[]): GameViewDto {
    const dto = new GameViewDto();

    dto.id = game.id;
    dto.status = game.status;
    dto.questions = questions?.map(QuestionViewDto.mapToView);
    dto.pairCreatedDate = game.createdAt;
    dto.firstPlayerProgress = PlayerViewDto.mapToView(game.firstPlayer);
    dto.secondPlayerProgress = game.secondPlayer
      ? PlayerViewDto.mapToView(game.secondPlayer)
      : null;

    return dto;
  }
}
