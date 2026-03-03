import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordRecovery } from '../domain/password-recovery.entity';

export class UsersPasswordRecoveryRepository {
  constructor(
    @InjectRepository(PasswordRecovery)
    private readonly usersPasswordRecoveryRepository: Repository<PasswordRecovery>,
  ) {}

  async save(passwordRecovery: PasswordRecovery): Promise<void> {
    await this.usersPasswordRecoveryRepository.save(passwordRecovery);
  }
}
