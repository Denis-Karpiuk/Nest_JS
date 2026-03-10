import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQuestionsQueryParamsDto } from '../../api/input-dto/get-questions-query-params.input.dto';
import { QuestionsQueryRepository } from '../../infrastructure/question.query-repository';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { QuestionViewDto } from '../../api/view-dto/question.view-dto';

export class GetQuestionsQuery {
  constructor(public readonly query: GetQuestionsQueryParamsDto) {}
}

@QueryHandler(GetQuestionsQuery)
export class GetQuestionsQueryHandler implements IQueryHandler<GetQuestionsQuery> {
  constructor(
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  async execute(
    query: GetQuestionsQuery,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return this.questionsQueryRepository.getAllQuestions(query.query);
  }
}
