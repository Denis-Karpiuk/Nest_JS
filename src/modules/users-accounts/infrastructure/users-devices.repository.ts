import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { UserDevice } from '../domain/devices.entity';

@Injectable()
export class UsersDevicesRepository {
  constructor(
    @InjectRepository(UserDevice)
    private readonly deviceRepository: Repository<UserDevice>,
  ) {}

  async findDevicesByUserId(userId: string): Promise<UserDevice[] | null> {
    return this.deviceRepository.find({
      where: { userId },
    });
  }

  async updateDevice(userId: string, device: UserDevice): Promise<void> {
    const existing = await this.deviceRepository.findOne({
      where: {
        userId,
        ip: device.ip,
        title: device.title,
      },
    });

    if (existing) {
      existing.lastActiveDate = device.lastActiveDate;
      existing.deviceId = device.deviceId;
      existing.iat = device.iat;
      existing.exp = device.exp;
      await this.deviceRepository.save(existing);
    } else {
      await this.deviceRepository.save({
        ...device,
        userId,
      });
    }
  }

  async findDeviceByIpAndName(
    userId: string,
    ipAddress: string,
    deviceName: string,
  ): Promise<UserDevice | null> {
    return this.deviceRepository.findOne({
      where: {
        userId,
        ip: ipAddress,
        title: deviceName,
      },
    });
  }

  async findDeviceByDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<UserDevice | null> {
    return this.deviceRepository.findOne({
      where: {
        userId,
        deviceId,
      },
    });
  }

  async findUserIdByDeviceId(deviceId: string): Promise<string | null> {
    const device = await this.deviceRepository.findOne({
      where: { deviceId },
      select: ['userId'],
    });
    return device?.userId ?? null;
  }

  async findDevicesByIat(
    userId: string,
    iat: number,
  ): Promise<UserDevice[] | null> {
    const devices = await this.deviceRepository.find({
      where: {
        userId,
        iat,
      },
    });
    return devices.length ? devices : null;
  }

  async deleteUserDevice(userId: string, deviceId: string): Promise<void> {
    await this.deviceRepository.delete({ userId, deviceId });
  }

  async deleteAllUserDevicesExcludeCurrentDevice(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.deviceRepository.delete({
      userId,
      deviceId: Not(deviceId),
    });
  }

  async save(device: UserDevice): Promise<UserDevice> {
    return this.deviceRepository.save(device);
  }
}
