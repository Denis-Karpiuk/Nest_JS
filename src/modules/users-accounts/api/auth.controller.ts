import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { Types } from 'mongoose';
import {
  LoginUserCommand,
  LoginUserCommandResult,
} from '../application/usecases/login-user.usecase';
import { ConfirmationRegisterUserCommand } from '../application/usecases/users/confirmation-register-user.usecase';
import { CreateNewPasswordUserCommand } from '../application/usecases/users/create-new-password-user.usecase';
import { PasswordRecoveryUserCommand } from '../application/usecases/users/password-recovery-user.usecase';
import { RegisterUserCommand } from '../application/usecases/users/register-user.usecase';
import { ResendRegistrationEmailUserCommand } from '../application/usecases/users/resend-registration-email-user';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { CreateNewPasswordInputDto } from './input-dto/create-new-password.input-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { MeViewDto } from './view-dto/users.view-dto';
import { GetMeQuery } from '../application/queries/get-me.query';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(@Body() body: RegistrationConfirmationInputDto) {
    return this.commandBus.execute(
      new ConfirmationRegisterUserCommand(body.code),
    );
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(@Body() body: RegistrationEmailResendingInputDto) {
    return this.commandBus.execute(
      new ResendRegistrationEmailUserCommand(body.email),
    );
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      LoginUserCommandResult
    >(new LoginUserCommand(user.id, user.login));

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return { accessToken };
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(@Body() body: PasswordRecoveryInputDto) {
    return this.commandBus.execute(new PasswordRecoveryUserCommand(body.email));
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  createNewPassword(@Body() body: CreateNewPasswordInputDto) {
    return this.commandBus.execute(new CreateNewPasswordUserCommand(body));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.queryBus.execute(new GetMeQuery(new Types.ObjectId(user.id)));
  }
}
