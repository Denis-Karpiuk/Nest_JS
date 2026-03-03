import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CreatePasswordRecoveryDomainDto } from './dto/create-password-recovery.domain.dto';

@Entity()
export class PasswordRecovery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recoveryCode: string;

  @Column()
  expirationDate: Date;

  @OneToOne(() => User, (user) => user.passwordRecoveryInformation)
  @JoinColumn()
  user: User;

  static createInstance(
    dto: CreatePasswordRecoveryDomainDto,
  ): PasswordRecovery {
    const passwordRecovery = new this();

    passwordRecovery.user = { id: dto.userId } as User;
    passwordRecovery.recoveryCode = dto.recoveryCode;
    passwordRecovery.expirationDate = new Date(Date.now() + 2 * 60 * 1000);
    return passwordRecovery;
  }
}
