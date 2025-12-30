import { IsEmail, Length, Matches } from 'class-validator';

export const LOGIN_PATTERN = /^[a-zA-Z0-9_-]*$/;
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateUserInputDto {
  @Matches(LOGIN_PATTERN)
  @Length(3, 10)
  login: string;

  @Length(6, 20)
  password: string;

  @Matches(EMAIL_PATTERN)
  @IsEmail()
  email: string;
}
