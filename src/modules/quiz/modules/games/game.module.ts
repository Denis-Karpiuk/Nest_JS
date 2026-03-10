import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './domain/game.entity';
import { PlayerProgress } from './domain/player-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, PlayerProgress])],
  providers: [],
})
export class GameModule {}
