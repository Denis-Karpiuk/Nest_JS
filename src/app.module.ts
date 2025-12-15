import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/users-accounts/users-accounts.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://mongo:FedsKSJmPEkEDQXfVNKqthqJpjKbbkIG@ballast.proxy.rlwy.net:53692',
      {
        dbName: 'nest_js',
      },
    ),
    UserAccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
