import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../questions/infrastructure/questions.repository';
import { CreatePairGameInputDto } from '../../api/input-dto/create-pair-game.input.dto';
import { GameStatus } from '../../domain/dto/create-game.dto';
import { Game } from '../../domain/game.entity';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { GameRepository } from '../../infrastructure/game.repository';

export class ConnectPairGameCommand {
  constructor(public readonly dto: CreatePairGameInputDto) {}
}

@CommandHandler(ConnectPairGameCommand)
export class ConnectGameCommandUseCase implements ICommandHandler<CreatePairGameInputDto> {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly questionsRepository: QuestionsRepository,
    private readonly gameQueryRepository: GameQueryRepository,
  ) {}

  async execute(dto: CreatePairGameInputDto): Promise<Game> {
    const pendingSecondPlayerGame = await this.gameRepository.findGamyByStatus(
      GameStatus.PendingSecondPlayer,
    );

    let gameId = '';

    if (!pendingSecondPlayerGame) {
      const questions = await this.questionsRepository.findRandomQuestions(5);

      const game = Game.createInstance({
        firstPlayerProgressId: dto.playerId,
        questions,
      });

      gameId = game.id;

      await this.gameRepository.save(game);
    }

    if (pendingSecondPlayerGame) {
      pendingSecondPlayerGame.addSecondPlayer({ playerId: dto.playerId });

      await this.gameRepository.save(pendingSecondPlayerGame);

      gameId = pendingSecondPlayerGame.id;
    }

    return await this.gameQueryRepository.getByIdOrNotFoundFail(gameId);
  }
}
