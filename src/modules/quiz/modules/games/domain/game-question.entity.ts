import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from '../../questions/domain/question.entity';
import { CreateGameQuestionDto } from './dto/create-game-questions.dto';
import { Game } from './game.entity';

@Entity()
export class GameQuestion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Question)
  question: Question;

  @ManyToOne(() => Game)
  game: Game;

  static createInstance(dto: CreateGameQuestionDto): GameQuestion {
    const gameQuestion = new this();

    gameQuestion.question = { id: dto.questionId } as Question;
    gameQuestion.game = { id: dto.gameId } as Game;

    return gameQuestion;
  }
}
