import { UserDocument } from '../../domain/user.entity';

export class SecureDevicesViewDto {
  devices: {
    ip: string;
    title: string;
    lastActiveDate: Date;
    deviceId: string;
  }[];

  static mapToView(user: UserDocument): SecureDevicesViewDto {
    const dto = new SecureDevicesViewDto();

    dto.devices = user.devices.map((device) => ({
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
      deviceId: device.deviceId,
    }));

    return dto;
  }
}
