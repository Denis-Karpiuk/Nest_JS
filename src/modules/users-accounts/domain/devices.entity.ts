import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  userId: string;

  @Column()
  iat: number;

  @Column()
  exp: number;
}

export type DeviceType = Omit<UserDevice, 'id'>;
