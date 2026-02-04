import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { UsersController } from './api/users.controller';
import { UsersFactory } from './application/factories/users.factory';
import { GetAllUsersQueryHandler } from './application/queries/get-all-users.query';
import { GetMeQueryHandler } from './application/queries/get-me.query';
import { GetSecureDevicesQueryHandler } from './application/queries/get-secure-devices.query';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query';
import { AuthService } from './application/services/auth.service';
import { CryptoService } from './application/services/crypto.service';
import { SecurityService } from './application/services/security.service';
import { UsersExternalService } from './application/services/users.external-service';
import { CreateUserUseCase } from './application/usecases/admin/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/admin/delete-user.usecase';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { LogoutUserUseCase } from './application/usecases/logout-user.usecase';
import { RefreshTokenUseCase } from './application/usecases/refresh-token.usecase';
import { DeleteSecurityAllDevicesUseCase } from './application/usecases/security/delete-security-all-devices';
import { DeleteSecurityDeviceUseCase } from './application/usecases/security/delete-security-device';
import { UpdateUserUseCase } from './application/usecases/update-user.usecase';
import { ConfirmationRegisterUserUseCase } from './application/usecases/users/confirmation-register-user.usecase';
import { CreateNewPasswordUserUseCase } from './application/usecases/users/create-new-password-user.usecase';
import { PasswordRecoveryUserUseCase } from './application/usecases/users/password-recovery-user.usecase';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { ResendRegistrationEmailUserUseCase } from './application/usecases/users/resend-registration-email-user';
import { AuthConfig } from './config/auth.config';
import { User, UserSchema } from './domain/user.entity';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { JwtRefreshStrategy } from './guards/refresh/jwt-refresh.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { jwtAccessModule, jwtRefreshModule } from './modules/jwt-module';
import { throttleModule } from './modules/throttle-module';

const commandHandlers = [
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  LoginUserUseCase,
  RegisterUserUseCase,
  ConfirmationRegisterUserUseCase,
  ResendRegistrationEmailUserUseCase,
  CreateNewPasswordUserUseCase,
  PasswordRecoveryUserUseCase,
  DeleteSecurityDeviceUseCase,
  DeleteSecurityAllDevicesUseCase,
  RefreshTokenUseCase,
  LogoutUserUseCase,
];

const queryHandlers = [
  GetUserByIdQueryHandler,
  GetAllUsersQueryHandler,
  GetMeQueryHandler,
  GetSecureDevicesQueryHandler,
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
    ...queryHandlers,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    UsersFactory,
    AuthService,
    UsersRepository,
    UsersQueryRepository,
    SecurityDevicesQueryRepository,
    AuthQueryRepository,
    UsersExternalQueryRepository,
    UsersExternalService,
    CryptoService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    AuthConfig,
    jwtAccessModule,
    jwtRefreshModule,
    SecurityService,
  ],
  exports: [UsersExternalQueryRepository, UsersExternalService],
})
export class UserAccountsModule {}
