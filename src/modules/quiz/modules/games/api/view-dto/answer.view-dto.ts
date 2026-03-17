import { Answer } from '../../domain/answer.entity';
import { AnswerStatus } from '../../domain/dto/create-answer.dto';

export class AnswerViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date;

  static mapToView(answer: Answer): AnswerViewDto {
    const dto = new AnswerViewDto();

    dto.questionId = answer.questionId;
    dto.answerStatus = answer.answerStatus;
    dto.addedAt = answer.addedAt;

    return dto;
  }
}
