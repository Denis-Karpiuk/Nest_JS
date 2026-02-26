import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { UserDevice } from '../../domain/devices.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersDevicesRepository } from '../../infrastructure/users-devices.repository';

export type RefreshTokenCommandResult = {
  accessToken: string;
  refreshToken: string;
};

export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<
  RefreshTokenCommand,
  RefreshTokenCommandResult
> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,

    private readonly userRepository: UsersRepository,
    private readonly usersDevicesRepository: UsersDevicesRepository,
  ) {}

  async execute({ refreshToken }: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid refresh token',
        extensions: [
          {
            field: 'refreshToken',
            message: 'Invalid refresh token',
          },
        ],
      });
    }

    const isTokenValid = refreshToken.split('.').length === 3;

    if (!isTokenValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid refresh token',
        extensions: [
          {
            field: 'refreshToken',
            message: 'Invalid refresh token',
          },
        ],
      });
    }

    try {
      const refreshTokenPayload = this.refreshTokenContext.verify<{
        id: string;
        login: string;
        deviceId: string;
      }>(refreshToken);
      const { id, login, deviceId } = refreshTokenPayload;

      const deviceResult = await this.usersDevicesRepository.findDeviceByDeviceId(
        id,
        deviceId,
      );

      if (!deviceResult) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'Device not found',
          extensions: [
            {
              field: 'deviceId',
              message: 'Device not found',
            },
          ],
        });
      }

      const { iat } = this.refreshTokenContext.decode<{
        iat: number;
        exp: number;
      }>(refreshToken);

      if (iat !== deviceResult.iat) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'Invalid refresh token',
          extensions: [
            {
              field: 'refreshToken',
              message: 'Invalid refresh token',
            },
          ],
        });
      }

      const accessToken = this.accessTokenContext.sign({
        id,
        login,
      });

      const newRefreshToken = this.refreshTokenContext.sign({
        id,
        login,
        deviceId,
      });

      const newRefreshTokenInfo = this.refreshTokenContext.decode<{
        iat: number;
        exp: number;
      }>(newRefreshToken);

      await this.usersDevicesRepository.updateDevice(id, {
        ...deviceResult,
        deviceId,
        iat: newRefreshTokenInfo.iat,
        exp: newRefreshTokenInfo.exp,
        lastActiveDate: new Date(),
        user: { id },
      } as UserDevice);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid refresh token',
        extensions: [
          {
            field: 'refreshToken',
            message: 'Invalid refresh token',
          },
        ],
      });
    }
  }
}
