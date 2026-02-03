import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { SecureDevicesViewDto } from '../../api/view-dto/secure-devices.view-dto';
import { Types } from 'mongoose';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getSecureDevices(
    userId: Types.ObjectId,
  ): Promise<SecureDevicesViewDto> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    return SecureDevicesViewDto.mapToView(user);
  }
}
