import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { EmailService } from 'src/modules/notifications/application/email.service';
import { User, type UserModelType } from '../../domain/user.entity';
import { CreateNewPasswordDto } from '../../dto/create-new-password.dto';
import { CreateUserDto, UpdateUserDto } from '../../dto/create-user.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from './crypto.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private readonly emailService: EmailService,
  ) {}

  async createUser({ email, login, password }: CreateUserDto): Promise<string> {
    const userWithTheSameLogin =
      await this.usersRepository.findByEmailOrLogin(login);
    const userWithTheSameEmail =
      await this.usersRepository.findByEmailOrLogin(email);

    if (userWithTheSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
        extensions: [
          {
            field: 'login',
            message: 'User with the same login already exists',
          },
        ],
      });
    }

    if (userWithTheSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same email already exists',
        extensions: [
          {
            field: 'email',
            message: 'User with the same email already exists',
          },
        ],
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(password);

    const user = this.UserModel.createInstance({
      email,
      login,
      passwordHash: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }
  async updateUser(id: Types.ObjectId, dto: UpdateUserDto): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
    // создаём метод
    user.update(dto); // change detection

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async registrationConfirmation(confirmationCode: string): Promise<void> {
    const user =
      await this.usersRepository.findByConfirmationCode(confirmationCode);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [
          {
            field: 'confirmationCode',
            message: 'User not found',
          },
        ],
      });
    }

    const isConfirmed = user.isEmailConfirmed;

    if (isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already confirmed',
        extensions: [
          {
            field: 'confirmationCode',
            message: 'User already confirmed',
          },
        ],
      });
    }

    const expirationData = user.emailConfirmation.expirationDate;

    if (expirationData < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code expired',
        extensions: [
          {
            field: 'confirmationCode',
            message: 'Confirmation code expired',
          },
        ],
      });
    }

    user.setIsEmailConfirmation(true);

    await this.usersRepository.save(user);

    this.emailService.sendVerifiedEmail(user.email);
  }

  async registrationEmailResending(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmailOrLogin(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [
          {
            field: 'email',
            message: 'User not found',
          },
        ],
      });
    }

    const isConfirmed = user.isEmailConfirmed;

    if (isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already confirmed',
        extensions: [
          {
            field: 'email',
            message: 'User already confirmed',
          },
        ],
      });
    }

    const confirmationCode = randomUUID();

    user.updateConfirmationInformation(confirmationCode);

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmationCode)
      .catch((err) => console.log('Error sending email', err));
  }

  async passwordRecovery(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmailOrLogin(email);

    const recoveryCode = randomUUID();

    if (user) {
      user.setRecoveryPasswordInformation(recoveryCode);
      await this.usersRepository.save(user);
    }

    this.emailService
      .sendPasswordRecoveryEmail(email, recoveryCode)
      .catch((err) => console.log('Error sending email', err));
  }

  async createNewPassword(dto: CreateNewPasswordDto): Promise<void> {
    const user = await this.usersRepository.findByRecoveryCode(
      dto.recoveryCode,
    );

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        extensions: [
          {
            field: 'recoveryCode',
            message: 'User not found',
          },
        ],
      });
    }

    const recoveryCodeExpirationDate =
      user?.passwordRecoveryInformation.expirationDate;

    if (recoveryCodeExpirationDate && recoveryCodeExpirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code expired',
        extensions: [
          {
            field: 'recoveryCode',
            message: 'Recovery code expired',
          },
        ],
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.newPassword,
    );

    user.updatePasswordHash(passwordHash);

    await this.usersRepository.save(user);
  }
}
