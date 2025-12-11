import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://mongo:FedsKSJmPEkEDQXfVNKqthqJpjKbbkIG@ballast.proxy.rlwy.net:53692',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
