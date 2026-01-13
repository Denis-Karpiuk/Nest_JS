import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersController } from './api/users.controller';
import { CryptoService } from './application/services/crypto.service';
import { UsersExternalService } from './application/services/users.external-service';
import { UsersService } from './application/services/users.service';
import { User, UserSchema } from './domain/user.entity';
import { LocalStrategy } from './guards/local/local.strategy';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { AuthService } from './application/services/auth.service';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { throttleModule } from './modules/throttle-module';
import { jwtModule } from './modules/jwt-module';
import { AuthConfig } from './config/auth.config';
import { CreateUserUseCase } from './application/usecases/admins/create-user.usecase';
import { UsersFactory } from './application/factories/users.factory';

const commandHandlers = [CreateUserUseCase];

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    throttleModule,
    jwtModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    ...commandHandlers,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    UsersFactory,
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
    AuthConfig,
  ],
  exports: [UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule {}
