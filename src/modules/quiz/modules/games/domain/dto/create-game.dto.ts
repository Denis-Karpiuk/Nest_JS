export class CreateGameDto {
  id: string;
  playerId: string;
}

export enum GameStatus {
  Active = 'Active',
  Finished = 'Finished',
  PendingSecondPlayer = 'PendingSecondPlayer',
}

export type GameQuestionItem = { id: string; body: string };
