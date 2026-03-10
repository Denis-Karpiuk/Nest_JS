import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PublishQuestionInputDto {
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;
}
