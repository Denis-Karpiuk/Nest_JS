import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './domain/game.entity';
import { PlayerProgress } from './domain/player-progress.entity';
import { PairsController } from './api/pairs.controller';
import { ConnectGameCommandUseCase } from './application/usecases/connect-game.usecase';
import { GameRepository } from './infrastructure/game.repository';
import { GameQueryRepository } from './infrastructure/game.query.repository';
import { QuestionsModule } from '../questions/questions.module';

const commandHandlers = [ConnectGameCommandUseCase];
@Module({
  imports: [TypeOrmModule.forFeature([Game, PlayerProgress]), QuestionsModule],
  providers: [...commandHandlers, GameRepository, GameQueryRepository],
  controllers: [PairsController],
})
export class GameModule {}
