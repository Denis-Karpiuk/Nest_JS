import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/modules/notifications/application/email.service';
import { CreateUserDto } from 'src/modules/users-accounts/dto/create-user.dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import request from 'supertest';
import { delay } from 'test/helpers/delay';
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
    login: 'auth',
    password: 'auth_pass',
    email: 'auth@test.com',
  };

  it('should registration user and return correct status code', async () => {
    await userTestManger.registration(createUserBody);
  });

  it(`should call email sending method while registration`, async () => {
    const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send({
        email: 'email@email.em',
        password: '123123123',
        login: 'login123',
      } as CreateUserDto)
      .expect(HttpStatus.NO_CONTENT);

    expect(sendEmailMethod).toHaveBeenCalled();
  });

  it('should login user and return access token', async () => {
    await userTestManger.registration(createUserBody);

    const response = await userTestManger.login(
      createUserBody.login,
      createUserBody.password,
    );

    expect(response).toEqual({
      accessToken: expect.any(String) as string,
      refreshTokenCookie: expect.any(String) as string,
    });

    expect(response.refreshTokenCookie).toBeDefined();
    expect(response.refreshTokenCookie).toContain('refreshToken=');
    expect(response.refreshTokenCookie).toContain('HttpOnly');
  });

  it("should't registration user with existing email", async () => {
    // Ждем, чтобы сбросить throttle счетчик от предыдущих тестов
    await delay(11000);

    await userTestManger.registration(createUserBody);

    const response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send({ ...createUserBody, login: 'other' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'email',
          message: 'User with the same email already exists',
        },
      ],
    });
  }, 15000);

  it("should't registration user with existing login", async () => {
    // Ждем, чтобы сбросить throttle счетчик от предыдущих тестов
    await delay(11000);

    await userTestManger.registration(createUserBody);

    const response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send({ ...createUserBody, email: 'email@email.em' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'login',
          message: 'User with the same login already exists',
        },
      ],
    });
  }, 15000);

  it('should return 429 if user tries to registration more than 5 times during 10 seconds', async () => {
    // Ждем 11 секунд (больше TTL), чтобы гарантированно сбросить throttle счетчик от предыдущих тестов
    await delay(11000);

    // Делаем 5 успешных запросов (лимит) - используем уникальные данные для каждого
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          login: `log${i}_${i}`,
          password: '123456789',
          email: `email${i}_${i}@test.com`,
        })
        .expect(HttpStatus.NO_CONTENT);
    }

    // 6-й запрос должен вернуть 429 (превышен лимит)
    const response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send({
        login: `throt_6`,
        password: '123456789',
        email: `throttle6@test.com`,
      })
      .expect(HttpStatus.TOO_MANY_REQUESTS);

    expect(response.body).toBe('To many requests');
  }, 20000); // Таймаут 20 секунд (11 секунд задержка + запас для запросов)
});
