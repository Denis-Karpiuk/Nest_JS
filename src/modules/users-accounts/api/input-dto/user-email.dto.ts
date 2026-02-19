import { IsEmail, IsNotEmpty } from 'class-validator';
// import { emailConstraints } from '../../domain/user.entity';
import { Trim } from 'src/core/decorators/transform/trim';

export class UserEmailDto {
  @Trim()
  @IsEmail()
  // @Matches(emailConstraints.match)
  @IsNotEmpty()
  email: string;
}
