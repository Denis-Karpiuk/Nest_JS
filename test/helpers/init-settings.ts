import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { Server } from 'node:http';
import { EmailService } from 'src/modules/notifications/application/email.service';
import { appSetup } from 'src/setup/app.setup';
import { EmailServiceMock } from 'test/mock/email-service.mock';
import { AppModule } from '../../src/app.module';
import { deleteAllData } from './delete-all-data';
import { UsersTestManager } from './users-tests-manager';
import { BlogsTestManager } from './blogs-tests-manager';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  appSetup(app);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer() as Server;

  const userTestManager = new UsersTestManager(app);

  const blogsTestManager = new BlogsTestManager(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManager,
    blogsTestManager,
  };
};
