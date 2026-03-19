import { Player } from '../../domain/player.entity';
import { AnswerViewDto } from './answer.view-dto';

export class PlayerViewDto {
  player: { id: string; login: string };
  answers: AnswerViewDto[];
  score: number;

  static mapToView(player: Player): PlayerViewDto {
    const dto = new PlayerViewDto();

    dto.player = {
      id: player.playerAccount.id,
      login: player.playerAccount.login,
    };
    dto.answers = [];
    dto.score = player.score;

    return dto;
  }
}
