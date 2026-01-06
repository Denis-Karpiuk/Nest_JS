import { RegistrationConfirmationInputDto } from './../api/input-dto/registration-confirmation.input-dto';
export class CreateUserDto {
  login: string;
  email: string;
  password: string;
}

export class UpdateUserDto {
  email: string;
}
