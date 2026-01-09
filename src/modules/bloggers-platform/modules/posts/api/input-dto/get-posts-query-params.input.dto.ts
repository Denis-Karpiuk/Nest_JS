import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';
import { IsEnum, IsOptional } from 'class-validator';

export class GetPostsQueryParamsDto extends BaseQueryParams {
  @IsEnum(PostsSortBy)
  @IsOptional()
  sortBy = PostsSortBy.CreatedAt;
}
