import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { SecurityService } from '../services/security.service';

export type LoginUserCommandResult = {
  accessToken: string;
  refreshToken: string;
};

export class LoginUserCommand {
  constructor(
    public readonly userId: string,
    public readonly login: string,
    public readonly deviceName: string,
    public readonly ipAddress: string,
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

    private readonly securityService: SecurityService,
  ) {}

  async execute({
    userId,
    login,
    deviceName,
    ipAddress,
  }: LoginUserCommand): Promise<LoginUserCommandResult> {
    const deviceId = randomUUID();

    const accessTokenPayload = { id: userId, login };
    const refreshTokenPayload = {
      ...accessTokenPayload,
      deviceId,
    };

    const accessToken = this.accessTokenContext.sign(accessTokenPayload);
    const refreshToken = this.refreshTokenContext.sign(refreshTokenPayload);

    const refreshTokenInfo = this.refreshTokenContext.decode<{
      iat: number;
      exp: number;
    }>(refreshToken);

    const device = {
      ip: ipAddress,
      title: deviceName,
      lastActiveDate: new Date(),
      deviceId,
      userId,
      iat: refreshTokenInfo.iat,
      exp: refreshTokenInfo.exp,
    };

    const existingDevice = await this.securityService.getDeviceByIpAndName(
      userId,
      ipAddress,
      deviceName,
    );

    if (existingDevice) {
      await this.securityService.updateUserDevice(userId, device);
    } else {
      await this.securityService.addUserDevice(userId, device);
    }

    return { accessToken, refreshToken };
  }
}
