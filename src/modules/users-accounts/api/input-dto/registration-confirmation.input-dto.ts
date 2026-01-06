import { IsString } from 'class-validator';

export class RegistrationConfirmationInputDto {
  @IsString()
  code: string;
}
