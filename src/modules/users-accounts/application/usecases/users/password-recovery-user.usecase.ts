import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { UserPasswordRecoveryEvent } from 'src/modules/users-accounts/domain/events/user-password-recovery.event';
import { PasswordRecovery } from 'src/modules/users-accounts/domain/password-recovery.entity';
import { UsersPasswordRecoveryRepository } from 'src/modules/users-accounts/infrastructure/user-passwrod-recovery.repository';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';

export class PasswordRecoveryUserCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryUserCommand)
export class PasswordRecoveryUserUseCase implements ICommandHandler<PasswordRecoveryUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersPasswordRecoveryRepository: UsersPasswordRecoveryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ email }: PasswordRecoveryUserCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailOrLogin(email);

    const recoveryCode = randomUUID();

    if (user) {
      const passwordRecovery = PasswordRecovery.createInstance({
        userId: user.id,
        recoveryCode,
      });
      await this.usersPasswordRecoveryRepository.save(passwordRecovery);
    }

    this.eventBus.publish(new UserPasswordRecoveryEvent(email, recoveryCode));
  }
}
