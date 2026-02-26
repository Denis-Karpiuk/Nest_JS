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
    return this.userRepository
      .createQueryBuilder('u')
      .where(
        'u."emailConfirmation"->>\'confirmationCode\' = :confirmationCode',
        {
          confirmationCode,
        },
      )
      .getOne();
  }

  async findByRecoveryCode(recoveryCode: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('u')
      .where(
        'u."passwordRecoveryInformation"->>\'recoveryCode\' = :recoveryCode',
        { recoveryCode },
      )
      .getOne();
  }

  async findByEmailOrLogin(loginOrEmail: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :loginOrEmail', {
        loginOrEmail,
      })
      .orWhere('user.login = :loginOrEmail', { loginOrEmail })
      .getOne();
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
