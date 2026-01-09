import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';
import { IsEnum, IsOptional } from 'class-validator';

export class GetBlogsQueryParamsDto extends BaseQueryParams {
  @IsEnum(BlogsSortBy)
  @IsOptional()
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}
