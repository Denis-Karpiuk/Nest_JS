import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { IsStringWithTrim } from 'src/core/decorators/validation/is-string-with-trim';

export class CreateBlogInputDto {
  @IsString()
  @IsNotEmpty()
  @IsStringWithTrim(1, 15)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsStringWithTrim(1, 500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}
