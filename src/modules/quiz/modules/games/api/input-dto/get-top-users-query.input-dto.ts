import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';

/**
 * GET `/pair-game-quiz/users/top`
 *
 * sort can be passed multiple times:
 * ?sort=avgScores desc&sort=sumScore desc...
 *
 * After transformation, back-end receives:
 * sort: ["avgScores desc", "sumScore desc", ...]
 */
export class GetTopUsersQueryParamsDto extends BaseQueryParams {
  @IsOptional()
  @Transform(({ value }: { value: unknown }): string[] | undefined => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
      // class-transformer gives `unknown`; keep only strings to satisfy strict TS/ESLint rules
      return value.filter((v): v is string => typeof v === 'string');
    }
    if (typeof value === 'string') return [value];
    return undefined;
  })
  sort?: string[];
}
