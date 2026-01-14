import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from '../application/services/auth.service';
import { UsersService } from '../application/services/users.service';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { AuthQueryRepository } from './../infrastructure/query/auth.query-repository';
import { CreateNewPasswordInputDto } from './input-dto/create-new-password.input-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { Types } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(@Body() body: RegistrationConfirmationInputDto) {
    return this.usersService.registrationConfirmation(body.code);
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(@Body() body: RegistrationEmailResendingInputDto) {
    return this.usersService.registrationEmailResending(body.email);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  login(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user.id.toString());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(new Types.ObjectId(user.id));
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(@Body() body: PasswordRecoveryInputDto) {
    return this.usersService.passwordRecovery(body.email);
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  createNewPassword(@Body() body: CreateNewPasswordInputDto) {
    return this.usersService.createNewPassword(body);
  }
}
