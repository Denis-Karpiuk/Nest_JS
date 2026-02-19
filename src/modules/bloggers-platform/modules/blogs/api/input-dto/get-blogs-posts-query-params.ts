import { Transform } from 'class-transformer';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PostsSortBy } from '../../../posts/api/input-dto/posts-sort-by';
import { IsEnum, IsOptional } from 'class-validator';

export class GetBlogsPostsQueryParamsDto extends BaseQueryParams {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.charAt(0).toLowerCase() + value.slice(1) : value,
  )
  @IsEnum(PostsSortBy)
  @IsOptional()
  sortBy = PostsSortBy.CreatedAt;
}
