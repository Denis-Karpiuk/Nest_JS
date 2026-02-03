import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';
import { DeviceType } from '../domain/devices.schema';
import { Types } from 'mongoose';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async findById(id: Types.ObjectId): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<UserDocument | null> {
    return await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': confirmationCode,
    });
  }

  async findByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
    return await this.UserModel.findOne({
      'passwordRecoveryInformation.recoveryCode': recoveryCode,
    });
  }

  async findByEmailOrLogin(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async findOrNotFoundFail(id: Types.ObjectId): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async updateDevice(
    userId: Types.ObjectId,
    device: DeviceType,
  ): Promise<void> {
    await this.UserModel.updateOne(
      {
        _id: userId,
        'devices.ip': device.ip,
        'devices.title': device.title,
      },
      { $set: { 'devices.$': device } },
    );
  }

  async findDeviceByIpAndName(
    userId: Types.ObjectId,
    ipAddress: string,
    deviceName: string,
  ): Promise<DeviceType | null> {
    const [device] = await this.UserModel.aggregate<DeviceType>([
      { $match: { _id: userId } },
      { $unwind: '$devices' },
      {
        $match: {
          'devices.ip': ipAddress,
          'devices.title': deviceName,
        },
      },
      { $replaceRoot: { newRoot: '$devices' } },
      { $limit: 1 },
    ]);

    return device ?? null;
  }
  async findDeviceByDeviceId(
    userId: Types.ObjectId,
    deviceId: string,
  ): Promise<DeviceType | null> {
    const [device] = await this.UserModel.aggregate<DeviceType>([
      { $match: { _id: userId } },
      { $unwind: '$devices' },
      {
        $match: {
          'devices.deviceId': deviceId,
        },
      },
      { $replaceRoot: { newRoot: '$devices' } },
      { $limit: 1 },
    ]);

    return device ?? null;
  }
  async findDevicesByIat(
    userId: Types.ObjectId,
    iat: number,
  ): Promise<DeviceType[] | null> {
    const devices = await this.UserModel.aggregate<DeviceType>([
      { $match: { _id: userId } },
      { $unwind: '$devices' },
      {
        $match: {
          'devices.iat': iat,
        },
      },
      { $replaceRoot: { newRoot: '$devices' } },
      { $limit: 1 },
    ]);

    return devices;
  }

  async deleteUserDevice(
    userId: Types.ObjectId,
    deviceId: string,
  ): Promise<void> {
    await this.UserModel.updateOne(
      { _id: userId, 'devices.deviceId': deviceId },
      { $pull: { devices: { deviceId } } },
    );
  }

  async deleteAllUserDevices(userId: Types.ObjectId): Promise<void> {
    await this.UserModel.updateOne({ _id: userId }, { $set: { devices: [] } });
  }

  async save(user: UserDocument) {
    await user.save();
  }
}
