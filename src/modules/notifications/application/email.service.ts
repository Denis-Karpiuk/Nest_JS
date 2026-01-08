import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  from: string;
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplatesService,
  ) {
    this.from = 'No Reply <' + this.configService.get<string>('EMAIL') + '>';
  }

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: this.from,
      subject: 'Confirmation registration code',
      html: this.emailTemplateService.registrationEmail(code),
    });
  }
  async sendVerifiedEmail(email: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: this.from,
      subject: 'Success verified email',
      html: this.emailTemplateService.verifiedEmailSuccess(),
    });
  }

  async sendPasswordRecoveryEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: this.from,
      subject: 'Recovery password code',
      html: this.emailTemplateService.passwordRecoveryEmail(code),
    });
  }
}
