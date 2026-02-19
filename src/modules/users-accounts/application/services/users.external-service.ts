import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

@Injectable()
export class UsersExternalService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async makeUserAsSpammer(userId: string) {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    await this.usersRepository.save(user);
  }
}
