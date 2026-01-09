import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId } from 'mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
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

  async save(user: UserDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }
}
