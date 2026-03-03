import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailConfirmation } from '../domain/email-confirmation.entity';

export class UsersEmailConfirmationRepository {
  constructor(
    @InjectRepository(EmailConfirmation)
    private readonly usersConfirmationRepository: Repository<EmailConfirmation>,
  ) {}

  async findByConfirmationCode(confirmationCode: string) {
    return this.usersConfirmationRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.user', 'u')
      .where('e.confirmationCode = :confirmationCode', { confirmationCode })
      .getOne();
  }

  async findByUserId(userId: string) {
    return this.usersConfirmationRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.user', 'u')
      .where('u.id = :userId', { userId })
      .getOne();
  }

  async save(emailConfirmation: EmailConfirmation): Promise<void> {
    await this.usersConfirmationRepository.save(emailConfirmation);
  }
}
