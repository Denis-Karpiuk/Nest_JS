import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplatesService,
  ) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    const from = 'No Reply <' + this.configService.get<string>('EMAIL') + '>';

    await this.mailerService.sendMail({
      to: email,
      from: from,
      subject: 'Confirmation registration code',
      html: this.emailTemplateService.registrationEmail(code),
    });
  }
}
