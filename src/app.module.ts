import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/users-accounts/users-accounts.module';
import { TestingModule } from './modules/testing/testing.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { configModule } from './config-module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { mongooseModule } from './mongoose-module';
import { postgresModule } from './postgres-module';
import { ThrottleHttpExceptionsFilter } from './core/exceptions/filters/throttle-exceptions.filter';
import { CoreModule } from './core/core.module';
import { QuizModule } from './modules/quiz/quiz.module';

@Module({
  imports: [
    configModule,
    mongooseModule,
    postgresModule,
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
    CoreModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottleHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {}
