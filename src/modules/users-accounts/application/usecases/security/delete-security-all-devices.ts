import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from 'src/modules/users-accounts/constants/auth-tokens.inject-constants';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';

export class DeleteSecurityAllDevicesCommand {
  constructor(
    public readonly userId: Types.ObjectId,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(DeleteSecurityAllDevicesCommand)
export class DeleteSecurityAllDevicesUseCase implements ICommandHandler<
  DeleteSecurityAllDevicesCommand,
  void
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private readonly refreshTokenContext: JwtService,
  ) {}

  async execute({
    userId,
    refreshToken,
  }: DeleteSecurityAllDevicesCommand): Promise<void> {
    const refreshTokenPayload = this.refreshTokenContext.verify<{
      id: string;
      deviceId: string;
    }>(refreshToken);

    const { deviceId } = refreshTokenPayload;

    await this.usersRepository.deleteAllUserDevicesExcludeCurrentDevice(
      userId,
      deviceId,
    );
  }
}
