import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from 'src/modules/users-accounts/domain/events/user-registered.event';
import { EmailService } from '../email.service';

@EventsHandler(UserRegisteredEvent)
export class SendConfirmationEmailWhenUserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private readonly emailService: EmailService) {}

  async handle(event: UserRegisteredEvent) {
    try {
      await this.emailService.sendConfirmationEmail(
        event.email,
        event.confirmationCode,
      );
    } catch (e) {
      console.error('Error sending email', e);
    }
  }
}
