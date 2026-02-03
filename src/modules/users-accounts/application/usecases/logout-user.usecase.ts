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
import { UsersRepository } from '../../infrastructure/users.repository';

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

    private readonly userRepository: UsersRepository,
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

      const devicesByIatResult = await this.userRepository.findDevicesByIat(
        new Types.ObjectId(id),
        iat,
      );

      if (!devicesByIatResult) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'Device not found',
          extensions: [
            {
              field: 'iat',
              message: 'Device not found',
            },
          ],
        });
      }

      await this.userRepository.deleteUserDevice(
        new Types.ObjectId(id),
        deviceId,
      );
    } catch (error) {
      console.error(error);

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
