import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserPasswordRecoveryEvent } from 'src/modules/users-accounts/domain/events/user-password-recovery.event';
import { EmailService } from '../email.service';

@EventsHandler(UserPasswordRecoveryEvent)
export class SendRecoveryEmailEventHandler implements IEventHandler<UserPasswordRecoveryEvent> {
  constructor(private readonly emailService: EmailService) {}

  async handle(event: UserPasswordRecoveryEvent) {
    try {
      await this.emailService.sendPasswordRecoveryEmail(
        event.email,
        event.recoveryCode,
      );
    } catch (e) {
      console.error('Error sending email', e);
    }
  }
}
