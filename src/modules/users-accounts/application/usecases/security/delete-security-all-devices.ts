import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';

export class DeleteSecurityAllDevicesCommand {
  constructor(public readonly userId: Types.ObjectId) {}
}

@CommandHandler(DeleteSecurityAllDevicesCommand)
export class DeleteSecurityAllDevicesUseCase implements ICommandHandler<
  DeleteSecurityAllDevicesCommand,
  void
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId }: DeleteSecurityAllDevicesCommand): Promise<void> {
    await this.usersRepository.deleteAllUserDevices(userId);
  }
}
