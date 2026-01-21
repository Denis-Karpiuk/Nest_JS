import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { CreateNewPasswordDto } from 'src/modules/users-accounts/dto/create-new-password.dto';
import { UsersRepository } from 'src/modules/users-accounts/infrastructure/users.repository';
import { CryptoService } from '../../services/crypto.service';

export class CreateNewPasswordUserCommand {
  constructor(public readonly dto: CreateNewPasswordDto) {}
}

@CommandHandler(CreateNewPasswordUserCommand)
export class CreateNewPasswordUserUseCase implements ICommandHandler<CreateNewPasswordUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute({ dto }: CreateNewPasswordUserCommand): Promise<void> {
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
