import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/users-accounts/users-accounts.module';
import { TestingModule } from './modules/testing/testing.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { configModule } from './config-module';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(
      'mongodb://mongo:FedsKSJmPEkEDQXfVNKqthqJpjKbbkIG@ballast.proxy.rlwy.net:53692',
      {
        dbName: 'nest_js',
      },
    ),
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
