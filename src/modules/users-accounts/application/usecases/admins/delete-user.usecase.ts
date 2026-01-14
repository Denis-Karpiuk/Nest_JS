import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';

export class DeleteUserCommand {
  constructor(public readonly userId: Types.ObjectId) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId }: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
