import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { UsersDevicesRepository } from 'src/modules/users-accounts/infrastructure/users-devices.repository';

export class DeleteSecurityDeviceCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteSecurityDeviceCommand)
export class DeleteSecurityDeviceUseCase implements ICommandHandler<
  DeleteSecurityDeviceCommand,
  void
> {
  constructor(
    private readonly usersDevicesRepository: UsersDevicesRepository,
  ) {}

  async execute({
    userId,
    deviceId,
  }: DeleteSecurityDeviceCommand): Promise<void> {
    const device = await this.usersDevicesRepository.findDeviceByDeviceId(
      userId,
      deviceId,
    );

    if (device) {
      await this.usersDevicesRepository.deleteUserDevice(userId, deviceId);
      return;
    }

    const ownerId =
      await this.usersDevicesRepository.findUserIdByDeviceId(deviceId);
    if (ownerId && ownerId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Device is not owned by the current user',
        extensions: [
          {
            field: 'deviceId',
            message: 'Device is not owned by the current user',
          },
        ],
      });
    }

    throw new DomainException({
      code: DomainExceptionCode.NotFound,
      message: 'Device not found',
      extensions: [
        {
          field: 'deviceId',
          message: 'Device not found',
        },
      ],
    });
  }
}
