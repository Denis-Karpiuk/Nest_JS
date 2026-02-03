import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';

export class DeleteSecurityDeviceCommand {
  constructor(
    public readonly userId: Types.ObjectId,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteSecurityDeviceCommand)
export class DeleteSecurityDeviceUseCase implements ICommandHandler<
  DeleteSecurityDeviceCommand,
  void
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
    deviceId,
  }: DeleteSecurityDeviceCommand): Promise<void> {
    const device = await this.usersRepository.findDeviceByDeviceId(
      userId,
      deviceId,
    );

    if (!device) {
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

    await this.usersRepository.deleteUserDevice(userId, deviceId);
  }
}
