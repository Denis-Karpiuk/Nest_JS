import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { UserVerifyRegisteredEvent } from 'src/modules/users-accounts/domain/events/user-verify-registered.event';
import { UsersEmailConfirmationRepository } from 'src/modules/users-accounts/infrastructure/user-confrimation.repository';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';

export class ConfirmationRegisterUserCommand {
  constructor(public readonly confirmationCode: string) {}
}

@CommandHandler(ConfirmationRegisterUserCommand)
export class ConfirmationRegisterUserUseCase implements ICommandHandler<ConfirmationRegisterUserCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersRepository: UsersRepository,
    private readonly usersEmailConfirmationRepository: UsersEmailConfirmationRepository,
  ) {}

  async execute({
    confirmationCode,
  }: ConfirmationRegisterUserCommand): Promise<void> {
    const emailConfirmation =
      await this.usersEmailConfirmationRepository.findByConfirmationCode(
        confirmationCode,
      );

    const user = emailConfirmation?.user;

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code is invalid or does not exist',
        extensions: [
          {
            field: 'code',
            message: 'Confirmation code is invalid or does not exist',
          },
        ],
      });
    }

    if (!emailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email confirmation not found',
      });
    }

    if (emailConfirmation?.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already confirmed',
        extensions: [
          {
            field: 'code',
            message: 'User already confirmed',
          },
        ],
      });
    }

    const expirationData = emailConfirmation.expirationDate;

    if (expirationData < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code expired',
        extensions: [
          {
            field: 'code',
            message: 'Confirmation code expired',
          },
        ],
      });
    }

    emailConfirmation.setEmailConfirmation(true);
    await this.usersEmailConfirmationRepository.save(emailConfirmation);

    this.eventBus.publish(new UserVerifyRegisteredEvent(user.email));
  }
}
