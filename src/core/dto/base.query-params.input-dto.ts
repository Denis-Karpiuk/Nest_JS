import { Transform, Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
  @Transform(
    ({ value, obj }: { value: unknown; obj: Record<string, unknown> }) => {
      const v = value ?? obj?.page ?? obj?.pageNumber;
      return v === undefined ? undefined : Number(v);
    },
  )
  @Type(() => Number)
  @IsOptional()
  pageNumber: number = 1;

  @Transform(
    ({ value, obj }: { value: unknown; obj: Record<string, unknown> }) => {
      const v = value ?? obj?.size ?? obj?.pageSize;
      return v === undefined ? undefined : Number(v);
    },
  )
  @Type(() => Number)
  @IsOptional()
  pageSize: number = 10;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Desc;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
