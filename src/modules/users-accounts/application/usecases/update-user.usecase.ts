import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UpdateUserDto } from 'src/modules/users-accounts/dto/create-user.dto';
import { UsersRepository } from '../../infrastructure/users.repository';

export class UpdateUserCommand {
  constructor(
    public readonly userId: Types.ObjectId,
    public readonly updateUserDto: UpdateUserDto,
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements ICommandHandler<
  UpdateUserCommand,
  Types.ObjectId
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
    updateUserDto,
  }: UpdateUserCommand): Promise<Types.ObjectId> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    user.update(updateUserDto);

    await this.usersRepository.save(user);

    return user._id;
  }
}
