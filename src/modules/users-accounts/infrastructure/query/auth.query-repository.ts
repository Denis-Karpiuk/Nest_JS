import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { Types } from 'mongoose';

@Injectable()
export class AuthQueryRepository {
  constructor(private readonly usersRepository: UsersRepository) {}

  async me(userId: Types.ObjectId): Promise<MeViewDto> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    return MeViewDto.mapToView(user);
  }
}
