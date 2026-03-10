import { Module } from '@nestjs/common';
import { GameModule } from './modules/games/game.module';
import { QuestionsModule } from './modules/questions/questions.module';

@Module({
  imports: [GameModule, QuestionsModule],
  providers: [],
})
export class QuizModule {}
