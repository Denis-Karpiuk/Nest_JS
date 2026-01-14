import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersController } from './api/users.controller';
import { UsersFactory } from './application/factories/users.factory';
import { GetAllUsersQueryHandler } from './application/queries/get-all-users.query';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query';
import { AuthService } from './application/services/auth.service';
import { CryptoService } from './application/services/crypto.service';
import { UsersExternalService } from './application/services/users.external-service';
import { UsersService } from './application/services/users.service';
import { CreateUserUseCase } from './application/usecases/admin/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/admin/delete-user.usecase';
import { UpdateUserUseCase } from './application/usecases/update-user.usecase';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { AuthConfig } from './config/auth.config';
import { User, UserSchema } from './domain/user.entity';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { throttleModule } from './modules/throttle-module';
import { JwtModule } from '@nestjs/jwt';
import { jwtAccessModule, jwtRefreshModule } from './modules/jwt-module';

const commandHandlers = [
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  GetAllUsersQueryHandler,
  GetUserByIdQueryHandler,
];

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    throttleModule,
    JwtModule,
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
    jwtAccessModule,
    jwtRefreshModule,
  ],
  exports: [UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule {}
