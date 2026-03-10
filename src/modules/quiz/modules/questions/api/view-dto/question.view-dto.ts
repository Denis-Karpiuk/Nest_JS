import { Question } from '../../domain/question.entity';

export class QuestionViewDto {
  id: string;

  static mapToView(question: Question): QuestionViewDto {
    const dto = new QuestionViewDto();

    dto.id = question.id;

    return dto;
  }
}
