import { MongooseModule } from '@nestjs/mongoose';

export const mongooseModule = MongooseModule.forRoot(process.env.MONGO_URI!);
