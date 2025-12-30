import { Module } from '@nestjs/common';

import { EmailTemplatesService } from './application/email-templates.service';
import { EmailService } from './application/email.service';
import { mailerModule } from './modules/mailer-module';

@Module({
  imports: [mailerModule],
  providers: [EmailService, EmailTemplatesService],
  exports: [EmailService],
})
export class NotificationsModule {}
