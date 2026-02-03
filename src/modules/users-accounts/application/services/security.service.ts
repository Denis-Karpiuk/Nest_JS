import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { DeviceType } from '../../domain/devices.schema';
import { UsersRepository } from '../../infrastructure/users.repository';

@Injectable()
export class SecurityService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async addUserDevice(
    userId: Types.ObjectId,
    device: DeviceType,
  ): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);
    user.addDevice(device);

    await this.usersRepository.save(user);
  }

  async updateUserDevice(
    userId: Types.ObjectId,
    device: DeviceType,
  ): Promise<void> {
    await this.usersRepository.updateDevice(userId, device);
  }

  async getDeviceByIpAndName(
    userId: Types.ObjectId,
    ipAddress: string,
    deviceName: string,
  ): Promise<DeviceType | null> {
    return await this.usersRepository.findDeviceByIpAndName(
      userId,
      ipAddress,
      deviceName,
    );
  }

  async deleteUserDevice(
    userId: Types.ObjectId,
    deviceId: string,
  ): Promise<void> {
    await this.usersRepository.deleteUserDevice(userId, deviceId);
  }

  async deleteAllUserDevices(userId: Types.ObjectId): Promise<void> {
    await this.usersRepository.deleteAllUserDevices(userId);
  }
}
