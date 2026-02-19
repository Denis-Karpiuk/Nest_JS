import { Injectable } from '@nestjs/common';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { UsersRepository } from '../users.repository';
import { SecureDevicesViewDto } from '../../api/view-dto/secure-devices.view-dto';
import { UsersDevicesRepository } from '../users-devices.repository';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersDevicesRepository: UsersDevicesRepository,
  ) {}

  async getSecureDevices(userId: string): Promise<SecureDevicesViewDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    const devices =
      await this.usersDevicesRepository.findDevicesByUserId(userId);

    if (!devices) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Devices not found',
      });
    }

    return SecureDevicesViewDto.mapToView(devices);
  }
}
