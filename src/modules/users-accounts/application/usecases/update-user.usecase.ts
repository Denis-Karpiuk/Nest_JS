import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserDto } from 'src/modules/users-accounts/dto/create-user.dto';
import { UsersRepository } from '../../infrastructure/users.repository';

export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly updateUserDto: UpdateUserDto,
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements ICommandHandler<
  UpdateUserCommand,
  string
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId, updateUserDto }: UpdateUserCommand): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    user.update(updateUserDto);

    await this.usersRepository.save(user);

    return user.id;
  }
}
