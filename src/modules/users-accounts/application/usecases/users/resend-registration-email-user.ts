import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { UserRegisteredEvent } from 'src/modules/users-accounts/domain/events/user-registered.event';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';

export class ResendRegistrationEmailUserCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendRegistrationEmailUserCommand)
export class ResendRegistrationEmailUserUseCase implements ICommandHandler<ResendRegistrationEmailUserCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({ email }: ResendRegistrationEmailUserCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailOrLogin(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [
          {
            field: 'email',
            message: 'User not found',
          },
        ],
      });
    }

    const isConfirmed = user.isEmailConfirmed;

    if (isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already confirmed',
        extensions: [
          {
            field: 'email',
            message: 'User already confirmed',
          },
        ],
      });
    }

    const confirmationCode = randomUUID();

    user.updateConfirmationInformation(confirmationCode);

    await this.usersRepository.save(user);

    this.eventBus.publish(
      new UserRegisteredEvent(user.email, confirmationCode),
    );
  }
}
