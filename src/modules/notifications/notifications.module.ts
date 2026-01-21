import { Module } from '@nestjs/common';

import { EmailTemplatesService } from './application/email-templates.service';
import { EmailService } from './application/email.service';
import { mailerModule } from './mailer-module';
import { SendConfirmationEmailWhenUserRegisteredEventHandler } from './application/event-handlers/send-confirmation-email-when-user-registered.event-handler';
import { SendVerifyEmailWhenUserConfirmRegisteredEventHandler } from './application/event-handlers/send-verify-email-when-user-confirm-registered.event-handler';
import { SendRecoveryEmailEventHandler } from './application/event-handlers/send-recovery-email.event-handler';

@Module({
  imports: [mailerModule],
  providers: [
    EmailService,
    EmailTemplatesService,
    SendConfirmationEmailWhenUserRegisteredEventHandler,
    SendVerifyEmailWhenUserConfirmRegisteredEventHandler,
    SendRecoveryEmailEventHandler,
  ],
  exports: [EmailService],
})
export class NotificationsModule {}
