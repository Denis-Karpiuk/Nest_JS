import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CreateUserEmailConfirmationDomainDto } from './dto/create-user-email-confirmation.domain.dto';

@Entity()
export class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  confirmationCode: string;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  @Column({ default: false })
  isConfirmed: boolean;

  @OneToOne(() => User, (user) => user.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  static createInstance(
    dto: CreateUserEmailConfirmationDomainDto,
  ): EmailConfirmation {
    const emailConfirmation = new this();

    emailConfirmation.user = { id: dto.userId } as User;
    emailConfirmation.confirmationCode = dto.confirmationCode;
    emailConfirmation.expirationDate = new Date(Date.now() + 2 * 60 * 1000);
    emailConfirmation.isConfirmed = false;

    return emailConfirmation;
  }

  update(code: string) {
    this.expirationDate = new Date(Date.now() + 2 * 60 * 1000);
    this.setConfirmationCode(code);
    this.setEmailConfirmation(false);
  }

  setConfirmationCode(code: string) {
    this.confirmationCode = code;
  }

  setEmailConfirmation(isConfirmed: boolean) {
    this.isConfirmed = isConfirmed;
  }
}
