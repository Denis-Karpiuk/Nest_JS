import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UpdateUserDto } from '../dto/create-user.dto';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { UserDevice } from './devices.entity';
import { Comment } from 'src/modules/bloggers-platform/modules/comments/domain/comment.entity';
import { Like } from 'src/modules/bloggers-platform/modules/likes/domain/like.entity';
import { EmailConfirmation } from './email-confirmation.entity';
import { PasswordRecovery } from './password-recovery.entity';

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

  @OneToOne(() => PasswordRecovery, (passwordRecovery) => passwordRecovery.user)
  passwordRecoveryInformation: PasswordRecovery;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(
    () => EmailConfirmation,
    (emailConfirmation) => emailConfirmation.user,
  )
  emailConfirmation: EmailConfirmation;

  @OneToMany(() => UserDevice, (device) => device.user)
  devices: UserDevice[];

  @OneToMany(() => Comment, (comment) => comment.commentator)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  static createInstance(dto: CreateUserDomainDto): User {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;

    user.firstName = '';
    user.lastName = '';

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
      this.email = dto.email;
    }
  }

  updatePasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
  }
}
