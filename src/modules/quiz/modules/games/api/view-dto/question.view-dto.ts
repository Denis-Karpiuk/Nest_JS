import { Question } from '../../../questions/domain/question.entity';

export class QuestionViewDto {
  id: string;
  body: string;

  static mapToView(question: Question): QuestionViewDto {
    const dto = new QuestionViewDto();

    dto.id = question.id;
    dto.body = question.body;

    return dto;
  }
}
