import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from '../../infrastructure/question.query-repository';
import { Question } from '../../domain/question.entity';

export class GetQuestionByIdQuery {
  constructor(public readonly questionId: string) {}
}

@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdQueryHandler implements IQueryHandler<GetQuestionByIdQuery> {
  constructor(
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  async execute(query: GetQuestionByIdQuery): Promise<Question> {
    return await this.questionsQueryRepository.getByIdOrNotFoundFail(
      query.questionId,
    );
  }
}
