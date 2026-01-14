import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';

export type LoginUserCommandResult = {
  accessToken: string;
  refreshToken: string;
};

export class LoginUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<
  LoginUserCommand,
  LoginUserCommandResult
> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,
  ) {}

  async execute({ userId }: LoginUserCommand): Promise<LoginUserCommandResult> {
    const accessToken = this.accessTokenContext.sign({
      id: userId,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: userId,
    });

    return { accessToken, refreshToken };
  }
}
