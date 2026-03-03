import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from 'src/modules/users-accounts/dto/create-user.dto';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';
import { UsersFactory } from '../../factories/users.factory';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { UsersEmailConfirmationRepository } from 'src/modules/users-accounts/infrastructure/user-confrimation.repository';
import { EmailConfirmation } from 'src/modules/users-accounts/domain/email-confirmation.entity';

export class CreateUserCommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  string
> {
  constructor(
    private readonly usersFactory: UsersFactory,
    private readonly usersRepository: UsersRepository,
    private readonly usersEmailConfirmationRepository: UsersEmailConfirmationRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { login, email } = command.createUserDto;

    await this.checkIfUserWithTheSameLoginOrEmailExists(login, 'login');
    await this.checkIfUserWithTheSameLoginOrEmailExists(email, 'email');

    const user = await this.usersFactory.create(command.createUserDto);

    // Сначала сохраняем пользователя, чтобы получить сгенерированный id
    await this.usersRepository.save(user);

    const emailConfirmation = EmailConfirmation.createInstance({
      confirmationCode: '',
      userId: user.id,
    });

    emailConfirmation.setEmailConfirmation(true);

    await this.usersEmailConfirmationRepository.save(emailConfirmation);

    return user.id;
  }

  private async checkIfUserWithTheSameLoginOrEmailExists(
    emailOrLogin: string,
    field: string,
  ): Promise<void> {
    const result = await this.usersRepository.findByEmailOrLogin(emailOrLogin);

    if (result) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `User with the same ${field} already exists`,
        extensions: [
          {
            field: `${field}`,
            message: `User with the same ${field} already exists`,
          },
        ],
      });
    }
  }
}
