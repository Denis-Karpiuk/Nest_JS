import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user.entity';
import { UserExternalDto } from './external-dto/users.external-dto';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserExternalDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserExternalDto.mapToView(user);
  }

  async getUserLoginById(userId: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });

    return user?.login || null;
  }
}
