import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsModule } from '../questions/questions.module';
import { PairsController } from './api/pairs.controller';
import { GetGameByIdQueryHandler } from './application/queries/get-game-by-id.query-handler';
import { AddAnswerCommandUseCase } from './application/usecases/add-answer.usecase';
import { ConnectGameCommandUseCase } from './application/usecases/connect-game.usecase';
import { Answer } from './domain/answer.entity';
import { GameQuestion } from './domain/game-question.entity';
import { Game } from './domain/game.entity';
import { Player } from './domain/player.entity';
import { AnswerRepository } from './infrastructure/answer.repository';
import { GameQueryRepository } from './infrastructure/game.query.repository';
import { GameQuestionQueryRepository } from './infrastructure/game.question.query.repository';
import { GameRepository } from './infrastructure/game.repository';
import { PlayerRepository } from './infrastructure/player.repository';
import { GameQuestionRepository } from './infrastructure/game.question.repository';
import { GetUserCurrentGameQueryHandler } from './application/queries/get-user-current-game.query-handler';
import { GetAllUserGamesQueryHandler } from './application/queries/get-all-user-games.query-handler';
import { GetGamesStatisticsQueryHandler } from './application/queries/get-games-statistics.query-handler';

const commandHandlers = [ConnectGameCommandUseCase, AddAnswerCommandUseCase];
const queryHandlers = [
  GetGameByIdQueryHandler,
  GetUserCurrentGameQueryHandler,
  GetAllUserGamesQueryHandler,
  GetGamesStatisticsQueryHandler,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([Game, Player, GameQuestion, Answer]),
    QuestionsModule,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    GameRepository,
    GameQueryRepository,
    PlayerRepository,
    GameQuestionQueryRepository,
    AnswerRepository,
    GameQuestionRepository,
  ],
  controllers: [PairsController],
})
export class GameModule {}
