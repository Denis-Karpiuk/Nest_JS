import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PublishedStatuses } from './published-statuses';
import { QuestionsSortBy } from './questions-sort-by';

export class GetQuestionsQueryParamsDto extends BaseQueryParams {
  @IsString()
  @IsOptional()
  bodySearchTerm: string;

  @IsEnum(PublishedStatuses)
  @IsOptional()
  publishedStatus: PublishedStatuses;

  @IsEnum(QuestionsSortBy)
  @IsOptional()
  sortBy = QuestionsSortBy.CreatedAt;
}
