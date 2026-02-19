import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { UsersDevicesRepository } from '../../infrastructure/users-devices.repository';

export class LogoutUserCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<
  LogoutUserCommand,
  void
> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,

    private readonly usersDevicesRepository: UsersDevicesRepository,
  ) {}

  async execute({ refreshToken }: LogoutUserCommand): Promise<void> {
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
        deviceId: string;
      }>(refreshToken);

      const { id, deviceId } = refreshTokenPayload;

      const { iat } = this.refreshTokenContext.decode<{
        iat: number;
      }>(refreshToken);

      const devicesByIatResult = await this.usersDevicesRepository.findDevicesByIat(
        id,
        iat,
      );

      if (!devicesByIatResult?.length) {
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

      await this.usersDevicesRepository.deleteUserDevice(id, deviceId);
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
