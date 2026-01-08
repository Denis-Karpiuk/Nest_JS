import { IsEmail, Matches } from 'class-validator';

export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export class UserEmailDto {
  @IsEmail()
  @Matches(EMAIL_PATTERN)
  email: string;
}
