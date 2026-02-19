import { UserDevice } from '../../domain/devices.entity';

export class SecureDevicesViewDto {
  devices: {
    ip: string;
    title: string;
    lastActiveDate: Date;
    deviceId: string;
  }[];

  static mapToView(devices: UserDevice[]): SecureDevicesViewDto {
    const dto = new SecureDevicesViewDto();

    dto.devices = devices.map((device) => ({
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
      deviceId: device.deviceId,
    }));

    return dto;
  }
}
