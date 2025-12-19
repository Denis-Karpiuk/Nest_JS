import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';

export class GetPostsQueryParamsDto extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
}
