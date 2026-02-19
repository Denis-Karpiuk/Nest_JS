import { Injectable } from '@nestjs/common';
import { CryptoService } from '../services/crypto.service';
import { User } from '../../domain/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class UsersFactory {
  constructor(private readonly cryptoService: CryptoService) {}

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await this.createPasswordHash(dto);
    const user = this.createUserInstance(dto, passwordHash);

    return user;
  }

  private async createPasswordHash(dto: CreateUserDto) {
    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );
    return passwordHash;
  }

  private createUserInstance(dto: CreateUserDto, passwordHash: string) {
    const user = User.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });

    return user;
  }
}
