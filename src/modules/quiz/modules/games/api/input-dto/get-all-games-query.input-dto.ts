import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { PairSortBy } from './pair-sort-by';

export class GetAllGamesQueryParamsDto extends BaseQueryParams {
  @IsEnum(PairSortBy)
  @IsOptional()
  sortBy = PairSortBy.PairCreatedDate;
}
