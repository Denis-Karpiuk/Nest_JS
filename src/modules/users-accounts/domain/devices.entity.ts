import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column({ type: 'timestamp' })
  lastActiveDate: Date;

  @Column()
  deviceId: string;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  iat: number;

  @Column()
  exp: number;
}

export type DeviceType = Omit<UserDevice, 'id'>;
