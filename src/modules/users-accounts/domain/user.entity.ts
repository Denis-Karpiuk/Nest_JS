import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UpdateUserDto } from '../dto/create-user.dto';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { EmailConfirmation } from './email-confirmation.schema';
import { PasswordRecoveryInformation } from './password-recovery.schema';
import { UserDevice } from './devices.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  passwordHash: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Column({ type: 'jsonb' })
  emailConfirmation: EmailConfirmation;

  @Column({ type: 'jsonb' })
  passwordRecoveryInformation: PasswordRecoveryInformation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => UserDevice, (device) => device.user)
  devices: UserDevice[];

  static createInstance(dto: CreateUserDomainDto): User {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;
    user.isEmailConfirmed = false;

    user.firstName = '';
    user.lastName = '';

    user.emailConfirmation = {
      confirmationCode: '',
      expirationDate: new Date(),
    };

    user.passwordRecoveryInformation = {
      recoveryCode: null,
      expirationDate: null,
    };

    return user;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }

    this.deletedAt = new Date();
  }

  update(dto: UpdateUserDto) {
    if (dto.email !== this.email) {
      this.isEmailConfirmed = false;
      this.email = dto.email;
    }
  }

  updatePasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
  }

  setConfirmationCode(code: string) {
    this.emailConfirmation.confirmationCode = code;
  }

  setIsEmailConfirmation(isConfirmed: boolean) {
    this.isEmailConfirmed = isConfirmed;
  }

  updateConfirmationInformation(code: string) {
    this.emailConfirmation.expirationDate = new Date(
      Date.now() + 2 * 60 * 1000,
    );

    this.setConfirmationCode(code);

    this.setIsEmailConfirmation(false);
  }

  setRecoveryPasswordInformation(recoveryCode: string) {
    this.passwordRecoveryInformation = {
      recoveryCode,
      expirationDate: new Date(Date.now() + 2 * 60 * 1000),
    };
  }
}
