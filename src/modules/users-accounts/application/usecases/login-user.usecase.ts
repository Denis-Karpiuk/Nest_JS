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
  constructor(
    public readonly userId: string,
    public readonly login: string,
  ) {}
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

  async execute({
    userId,
    login,
  }: LoginUserCommand): Promise<LoginUserCommandResult> {
    const payload = { id: userId, login };

    const accessToken = this.accessTokenContext.sign(payload);
    const refreshToken = this.refreshTokenContext.sign(payload);

    return { accessToken, refreshToken };
  }
}
