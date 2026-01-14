import { Matches } from 'class-validator';
import { IsStringWithTrim } from 'src/core/decorators/validation/is-string-with-trim';
import {
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';
import { UserEmailDto } from './user-email.dto';

//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateUserInputDto extends UserEmailDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  @Matches(loginConstraints.match)
  login: string;

  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  password: string;
}
