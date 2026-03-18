import { IsUUID } from 'class-validator';

export class UuidInputDto {
  @IsUUID(4)
  id: string;
}
