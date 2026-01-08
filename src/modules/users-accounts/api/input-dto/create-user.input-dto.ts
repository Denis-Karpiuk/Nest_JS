import { IsEmail, Length, Matches } from 'class-validator';
import { UserEmailDto } from './user-email.dto';

export const LOGIN_PATTERN = /^[a-zA-Z0-9_-]*$/;

//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateUserInputDto extends UserEmailDto {
  @Matches(LOGIN_PATTERN)
  @Length(3, 10)
  login: string;

  @Length(6, 20)
  password: string;
}
