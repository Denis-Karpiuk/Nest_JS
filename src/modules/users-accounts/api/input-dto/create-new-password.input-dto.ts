import { IsString, Length } from 'class-validator';
import { CreateNewPasswordDto } from '../../dto/create-new-password.dto';

export class CreateNewPasswordInputDto implements CreateNewPasswordDto {
  @Length(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
