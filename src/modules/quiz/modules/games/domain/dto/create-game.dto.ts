export class CreateGameDto {
  firstPlayerProgressId: string;
  questions: GameQuestionItem[];
}

export enum GameStatus {
  Active = 'Active',
  Finished = 'Finished',
  PendingSecondPlayer = 'PendingSecondPlayer',
}

export type GameQuestionItem = { id: string; body: string };
