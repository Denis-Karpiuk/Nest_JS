import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/modules/users-accounts/dto/create-user.dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import request from 'supertest';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';
import { UsersTestManager } from 'test/helpers/users-tests-manager';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  const TEST_JWT_SECRET = 'test_access-token-secret';

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '2s' },
        }),
      ),
    );

    app = result.app;
    userTestManger = result.userTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  const createUserBody: CreateUserDto = {
    login: 'some_login',
    password: '123456789',
    email: 'some_email@test.com',
  };

  it('should registration user and return correct status code', async () => {
    await userTestManger.registration(createUserBody);
  });

  it("should't registration user with existing email", async () => {
    await userTestManger.registration(createUserBody);

    const response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send({ ...createUserBody, login: 'new_login' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'email',
          message: 'User with the same email already exists',
        },
      ],
    });
  });

  it("should't registration user with existing login", async () => {
    await userTestManger.registration(createUserBody);

    const response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send({ ...createUserBody, email: 'new_email@test.com' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'login',
          message: 'User with the same login already exists',
        },
      ],
    });
  });
});
