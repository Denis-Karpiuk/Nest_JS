import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { UserRegisteredEvent } from 'src/modules/users-accounts/domain/events/user-registered.event';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';
import { UsersEmailConfirmationRepository } from 'src/modules/users-accounts/infrastructure/user-confrimation.repository';

export class ResendRegistrationEmailUserCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendRegistrationEmailUserCommand)
export class ResendRegistrationEmailUserUseCase implements ICommandHandler<ResendRegistrationEmailUserCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersRepository: UsersRepository,
    private readonly usersEmailConfirmationRepository: UsersEmailConfirmationRepository,
  ) {}

  async execute({ email }: ResendRegistrationEmailUserCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailOrLogin(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is invalid or does not exist',
        extensions: [
          {
            field: 'email',
            message: 'Email is invalid or does not exist',
          },
        ],
      });
    }

    const emailConfirmation =
      await this.usersEmailConfirmationRepository.findByUserId(user.id);

    if (!emailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email confirmation not found',
        extensions: [
          {
            field: 'email',
            message: 'Email confirmation not found',
          },
        ],
      });
    }

    if (emailConfirmation?.isConfirmed) {
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

    emailConfirmation.update(confirmationCode);

    await this.usersEmailConfirmationRepository.save(emailConfirmation);

    this.eventBus.publish(
      new UserRegisteredEvent(user.email, confirmationCode),
    );
  }
}
