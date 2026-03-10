import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IsStringWithTrim } from 'src/core/decorators/validation/is-string-with-trim';

export class CreateQuestionInputDto {
  @IsString()
  @IsNotEmpty()
  @IsStringWithTrim(10, 500)
  body: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  correctAnswers: string[];
}

export class UpdateQuestionInputDto extends CreateQuestionInputDto {}
