import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PostsSortBy } from '../../../posts/api/input-dto/posts-sort-by';

export class GetBlogsPostsQueryParamsDto extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
}
