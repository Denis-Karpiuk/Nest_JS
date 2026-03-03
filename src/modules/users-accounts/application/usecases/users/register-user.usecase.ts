import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from 'src/modules/users-accounts/dto/create-user.dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { UsersFactory } from '../../factories/users.factory';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';
import { uuid } from 'uuidv4';
import { UserRegisteredEvent } from 'src/modules/users-accounts/domain/events/user-registered.event';
import { UsersEmailConfirmationRepository } from 'src/modules/users-accounts/infrastructure/user-confrimation.repository';
import { EmailConfirmation } from 'src/modules/users-accounts/domain/email-confirmation.entity';

export class RegisterUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersFactory: UsersFactory,
    private readonly usersRepository: UsersRepository,
    private readonly usersEmailConfirmationRepository: UsersEmailConfirmationRepository,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const userWithTheSameLogin = await this.usersRepository.findByEmailOrLogin(
      dto.login,
    );
    const userWithTheSameEmail = await this.usersRepository.findByEmailOrLogin(
      dto.email,
    );

    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
        extensions: [
          {
            field: 'login',
            message: 'User with the same login already exists',
          },
        ],
      });
    }

    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same email already exists',
        extensions: [
          {
            field: 'email',
            message: 'User with the same email already exists',
          },
        ],
      });
    }

    const user = await this.usersFactory.create(dto);

    const confirmCode = uuid();

    const emailConfirmation = EmailConfirmation.createInstance({
      confirmationCode: confirmCode,
      userId: user.id,
    });

    await this.usersEmailConfirmationRepository.save(emailConfirmation);
    await this.usersRepository.save(user);

    this.eventBus.publish(new UserRegisteredEvent(user.email, confirmCode));
  }
}
