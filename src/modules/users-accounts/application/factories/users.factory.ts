import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CryptoService } from '../services/crypto.service';
import {
  User,
  UserDocument,
  type UserModelType,
} from '../../domain/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class UsersFactory {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: UserModelType,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
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
    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });
    return user;
  }
}
