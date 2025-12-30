import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from 'src/modules/notifications/application/email.service';
import { uuid } from 'uuidv4';
import { User, type UserModelType } from '../domain/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

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
        message: 'User with the same login already exists',
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
  async updateUser(id: string, dto: UpdateUserDto): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
    // создаём метод
    user.update(dto); // change detection

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  async registerUser(dto: CreateUserDto) {
    const userWithSameEmail = await this.usersRepository.findByEmailOrLogin(
      dto.email,
    );
    const userWithSameLogin = await this.usersRepository.findByEmailOrLogin(
      dto.login,
    );

    if (userWithSameEmail || userWithSameLogin) {
      throw new Error('user with same email or login already exists');
    }

    const createdUserId = await this.createUser(dto);

    const confirmationCode = uuid();

    const user = await this.usersRepository.findOrNotFoundFail(createdUserId);

    user.setConfirmationCode(confirmationCode);

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(dto.email, confirmationCode)
      .catch(console.error);
  }
}
