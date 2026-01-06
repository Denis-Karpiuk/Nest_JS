import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersController } from './api/users.controller';
import { CryptoService } from './application/crypto.service';
import { UsersExternalService } from './application/users.external-service';
import { UsersService } from './application/users.service';
import { User, UserSchema } from './domain/user.entity';
import { LocalStrategy } from './guards/local/local.strategy';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { jwtModule } from './modules/jwt-module';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './guards/bearer/jwt.strategy';

@Module({
  imports: [
    NotificationsModule,
    jwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    AuthService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    SecurityDevicesQueryRepository,
    AuthQueryRepository,
    UsersExternalQueryRepository,
    UsersExternalService,
    CryptoService,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule {}
