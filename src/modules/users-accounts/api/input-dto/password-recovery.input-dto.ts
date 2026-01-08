import { EMAIL_PATTERN } from './create-user.input-dto';
import { IsEmail, Matches } from 'class-validator';

export class PasswordRecoveryInputDto {
  @IsEmail()
  @Matches(EMAIL_PATTERN)
  email: string;
}
