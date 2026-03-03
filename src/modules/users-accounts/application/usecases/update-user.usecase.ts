import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserDto } from 'src/modules/users-accounts/dto/create-user.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersEmailConfirmationRepository } from 'src/modules/users-accounts/infrastructure/user-confrimation.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

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
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersEmailConfirmationRepository: UsersEmailConfirmationRepository,
  ) {}

  async execute({ userId, updateUserDto }: UpdateUserCommand): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    const emailConfirmation =
      await this.usersEmailConfirmationRepository.findByUserId(user.id);

    if (!emailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email confirmation not found',
      });
    }

    emailConfirmation.setEmailConfirmation(false);
    await this.usersEmailConfirmationRepository.save(emailConfirmation);

    user.update(updateUserDto);

    await this.usersRepository.save(user);

    return user.id;
  }
}
