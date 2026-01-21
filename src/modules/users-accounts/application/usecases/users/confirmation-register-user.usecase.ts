import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { UserVerifyRegisteredEvent } from 'src/modules/users-accounts/domain/events/user-verify-registered.event';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';

export class ConfirmationRegisterUserCommand {
  constructor(public readonly confirmationCode: string) {}
}

@CommandHandler(ConfirmationRegisterUserCommand)
export class ConfirmationRegisterUserUseCase implements ICommandHandler<ConfirmationRegisterUserCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({
    confirmationCode,
  }: ConfirmationRegisterUserCommand): Promise<void> {
    const user =
      await this.usersRepository.findByConfirmationCode(confirmationCode);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [
          {
            field: 'confirmationCode',
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
            field: 'confirmationCode',
            message: 'User already confirmed',
          },
        ],
      });
    }

    const expirationData = user.emailConfirmation.expirationDate;

    if (expirationData < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code expired',
        extensions: [
          {
            field: 'confirmationCode',
            message: 'Confirmation code expired',
          },
        ],
      });
    }

    user.setIsEmailConfirmation(true);

    await this.usersRepository.save(user);

    this.eventBus.publish(new UserVerifyRegisteredEvent(user.email));
  }
}
