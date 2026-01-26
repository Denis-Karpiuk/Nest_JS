import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { CommentsSortBy } from './comments-sort-by';
import { IsEnum, IsOptional } from 'class-validator';

export class GetCommentsQueryParamsDto extends BaseQueryParams {
  @IsEnum(CommentsSortBy)
  @IsOptional()
  sortBy = CommentsSortBy.CreatedAt;
}
