import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserVerifyRegisteredEvent } from 'src/modules/users-accounts/domain/events/user-verify-registered.event';
import { EmailService } from '../email.service';

@EventsHandler(UserVerifyRegisteredEvent)
export class SendVerifyEmailWhenUserConfirmRegisteredEventHandler implements IEventHandler<UserVerifyRegisteredEvent> {
  constructor(private readonly emailService: EmailService) {}

  async handle(event: UserVerifyRegisteredEvent) {
    try {
      await this.emailService.sendVerifiedEmail(event.email);
    } catch (e) {
      console.error('Error sending email', e);
    }
  }
}
