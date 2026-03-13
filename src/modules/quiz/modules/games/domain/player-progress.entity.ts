import { User } from 'src/modules/users-accounts/domain/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => User)
  playerAccount: User;
}
