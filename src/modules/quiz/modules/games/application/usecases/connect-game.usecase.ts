import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Question } from '../../../questions/domain/question.entity';
import { QuestionsRepository } from '../../../questions/infrastructure/questions.repository';
import { CreatePairGameInputDto } from '../../api/input-dto/create-pair-game.input.dto';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { GameStatus } from '../../domain/dto/create-game.dto';
import { GameQuestion } from '../../domain/game-question.entity';
import { Game } from '../../domain/game.entity';
import { Player } from '../../domain/player.entity';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { GameQuestionRepository } from '../../infrastructure/game.question.repository';

export class ConnectPairGameCommand {
  constructor(public readonly dto: CreatePairGameInputDto) {}
}

@CommandHandler(ConnectPairGameCommand)
export class ConnectGameCommandUseCase implements ICommandHandler<ConnectPairGameCommand> {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly questionsRepository: QuestionsRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameQuestionRepository: GameQuestionRepository,
  ) {}

  async execute(command: ConnectPairGameCommand): Promise<GameViewDto> {
    const dto = command.dto;

    const pendingSecondPlayerGame = await this.gameRepository.findGamyByStatus(
      GameStatus.PendingSecondPlayer,
    );

    let gameId = '';

    if (!pendingSecondPlayerGame) {
      const player = Player.createInstance({
        playerId: dto.playerId,
      });

      await this.playerRepository.save(player);

      const savedPlayer = await this.playerRepository.findByIdOrNotFoundFail(
        player.id,
      );

      const game = Game.createInstance({
        id: uuidv4(),
        playerId: savedPlayer.id,
      });

      await this.gameRepository.save(game);
      gameId = game.id;
    }

    let questions: Question[] = [];

    if (pendingSecondPlayerGame) {
      const player = Player.createInstance({
        playerId: dto.playerId,
      });

      await this.playerRepository.save(player);

      const savedPlayer = await this.playerRepository.findByIdOrNotFoundFail(
        player.id,
      );

      pendingSecondPlayerGame.addSecondPlayer({
        playerId: savedPlayer.id,
      });

      await this.gameRepository.save(pendingSecondPlayerGame);

      questions = await this.questionsRepository.findRandomQuestions(5);

      const gameQuestions = questions?.map((question) =>
        GameQuestion.createInstance({
          questionId: question.id,
          gameId: pendingSecondPlayerGame.id,
        }),
      );

      await this.gameQuestionRepository.saveMany(gameQuestions);

      gameId = pendingSecondPlayerGame.id;
    }

    const game = await this.gameQueryRepository.getByIdOrNotFoundFail(gameId);

    return GameViewDto.mapToView(game, questions);
  }
}
