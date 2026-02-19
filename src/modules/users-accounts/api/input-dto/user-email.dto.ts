import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

import { Trim } from 'src/core/decorators/transform/trim';

const emailConstraints = {
  match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
};

export class UserEmailDto {
  @Trim()
  @IsEmail()
  @Matches(emailConstraints.match)
  @IsNotEmpty()
  email: string;
}
