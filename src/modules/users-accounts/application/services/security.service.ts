import { Injectable } from '@nestjs/common';
import { UserDevice, DeviceType } from '../../domain/devices.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersDevicesRepository } from '../../infrastructure/users-devices.repository';

@Injectable()
export class SecurityService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersDevicesRepository: UsersDevicesRepository,
  ) {}

  async addUserDevice(userId: string, device: DeviceType): Promise<void> {
    await this.usersRepository.findOrNotFoundFail(userId);
    await this.usersDevicesRepository.save({
      ...device,
      userId,
    } as UserDevice);
  }

  async updateUserDevice(userId: string, device: DeviceType): Promise<void> {
    await this.usersDevicesRepository.updateDevice(userId, {
      ...device,
      userId,
    } as UserDevice);
  }

  async getDeviceByIpAndName(
    userId: string,
    ipAddress: string,
    deviceName: string,
  ): Promise<UserDevice | null> {
    return await this.usersDevicesRepository.findDeviceByIpAndName(
      userId,
      ipAddress,
      deviceName,
    );
  }

  async deleteUserDevice(userId: string, deviceId: string): Promise<void> {
    await this.usersDevicesRepository.deleteUserDevice(userId, deviceId);
  }

  async deleteAllUserDevicesExcludeCurrentDevice(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.usersDevicesRepository.deleteAllUserDevicesExcludeCurrentDevice(
      userId,
      deviceId,
    );
  }
}
