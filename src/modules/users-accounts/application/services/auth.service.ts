import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByEmailOrLogin(login);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user._id.toString(),
      login: user.login,
    };
  }
}
