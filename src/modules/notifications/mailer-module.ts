import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const mailerModule = MailerModule.forRootAsync({
  useFactory: (configService: ConfigService) => {
    return {
      transport: {
        host: configService.get<string>('SMTP_HOST'),
        secure: true,
        auth: {
          user: configService.get<string>('SMTP_USER'),
          pass: configService.get<string>('SMTP_PASS'),
        },
      },
      defaults: {
        from: `Denis <${configService.get<string>('EMAIL')}>`,
      },
    };
  },
  inject: [ConfigService],
});
