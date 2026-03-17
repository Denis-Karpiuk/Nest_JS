export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

export class CreateAnswerDto {
  questionId: string;
  playerId: string;
  answer: string;
  answerStatus: AnswerStatus;
}
