import { IsNotEmpty, IsString } from 'class-validator';
import { IsStringWithTrim } from 'src/core/decorators/validation/is-string-with-trim';

export class CreatePostCommentInputDto {
  @IsString()
  @IsNotEmpty()
  @IsStringWithTrim(20, 300)
  content: string;
}
