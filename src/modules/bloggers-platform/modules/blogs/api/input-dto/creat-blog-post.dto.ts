import { IsNotEmpty, IsString } from 'class-validator';
import { IsStringWithTrim } from 'src/core/decorators/validation/is-string-with-trim';
export class CreateBlogPostDto {
  @IsString()
  @IsNotEmpty()
  @IsStringWithTrim(1, 30)
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsStringWithTrim(1, 100)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @IsStringWithTrim(1, 1000)
  content: string;
}
