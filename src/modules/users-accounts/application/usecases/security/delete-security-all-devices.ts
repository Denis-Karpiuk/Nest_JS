import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from 'src/modules/users-accounts/constants/auth-tokens.inject-constants';
import { UsersDevicesRepository } from 'src/modules/users-accounts/infrastructure/users-devices.repository';

export class DeleteSecurityAllDevicesCommand {
  constructor(
    public readonly userId: string,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(DeleteSecurityAllDevicesCommand)
export class DeleteSecurityAllDevicesUseCase implements ICommandHandler<
  DeleteSecurityAllDevicesCommand,
  void
> {
  constructor(
    private readonly usersDevicesRepository: UsersDevicesRepository,
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

    await this.usersDevicesRepository.deleteAllUserDevicesExcludeCurrentDevice(
      userId,
      deviceId,
    );
  }
}
