import { EmailService } from 'src/modules/notifications/application/email.service';

export class EmailServiceMock extends EmailService {
  //override method
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    await Promise.resolve(() => {
      console.log(
        `Call mock method sendConfirmationEmail / EmailServiceMock, email: ${email}, code: ${code}`,
      );
    });
  }
  async sendVerifiedEmail(email: string): Promise<void> {
    await Promise.resolve(() => {
      console.log(
        `Call mock method sendVerifiedEmail / EmailServiceMock, email: ${email}`,
      );
    });
  }

  async sendPasswordRecoveryEmail(email: string, code: string): Promise<void> {
    await Promise.resolve(() => {
      console.log(
        `Call mock method sendPasswordRecoveryEmail / EmailServiceMock, email: ${email}, code: ${code}`,
      );
    });
  }
}
