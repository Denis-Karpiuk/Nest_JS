import { Injectable } from '@nestjs/common';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { User } from '../domain/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByConfirmationCode(confirmationCode: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { emailConfirmation: { confirmationCode } },
    });
  }

  async findByRecoveryCode(recoveryCode: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { passwordRecoveryInformation: { recoveryCode } },
    });
  }

  async findByEmailOrLogin(loginOrEmail: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async save(user: User): Promise<void> {
    await this.userRepository.save(user);
  }
}
