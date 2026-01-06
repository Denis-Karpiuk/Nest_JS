import { MongooseModule } from '@nestjs/mongoose';

export const mongooseModule = MongooseModule.forRoot(
  'mongodb://mongo:FedsKSJmPEkEDQXfVNKqthqJpjKbbkIG@ballast.proxy.rlwy.net:53692',
  {
    dbName: 'nest_js',
  },
);
