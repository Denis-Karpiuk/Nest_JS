import { Module } from '@nestjs/common';

import { EmailTemplatesService } from './application/email-templates.service';
import { EmailService } from './application/email.service';
import { mailerModule } from './mailer-module';
import { SendConfirmationEmailWhenUserRegisteredEventHandler } from './application/event-handlers/send-confirmation-email-when-user-registered.event-handler';

@Module({
  imports: [mailerModule],
  providers: [
    EmailService,
    EmailTemplatesService,
    SendConfirmationEmailWhenUserRegisteredEventHandler,
  ],
  exports: [EmailService],
})
export class NotificationsModule {}
