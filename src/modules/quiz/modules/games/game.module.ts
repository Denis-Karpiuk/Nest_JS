import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsModule } from '../questions/questions.module';
import { PairsController } from './api/pairs.controller';
import { ConnectGameCommandUseCase } from './application/usecases/connect-game.usecase';
import { GameQuestion } from './domain/game-question.entity';
import { Game } from './domain/game.entity';
import { Player } from './domain/player.entity';
import { AnswerRepository } from './infrastructure/answer.repository';
import { GameQueryRepository } from './infrastructure/game.query.repository';
import { GameQuestionRepository } from './infrastructure/game.question.repository';
import { GameRepository } from './infrastructure/game.repository';
import { PlayerRepository } from './infrastructure/player.repository';
import { AddAnswerCommandUseCase } from './application/usecases/add-answer.usecase';
import { Answer } from './domain/answer.entity';

const commandHandlers = [ConnectGameCommandUseCase, AddAnswerCommandUseCase];
@Module({
  imports: [
    TypeOrmModule.forFeature([Game, Player, GameQuestion, Answer]),
    QuestionsModule,
  ],
  providers: [
    ...commandHandlers,
    GameRepository,
    GameQueryRepository,
    PlayerRepository,
    GameQuestionRepository,
    AnswerRepository,
  ],
  controllers: [PairsController],
})
export class GameModule {}
