import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { UserViewDto } from 'src/modules/users-accounts/api/view-dto/users.view-dto';
import { CreateUserDto } from 'src/modules/users-accounts/dto/create-user.dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import request from 'supertest';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';
import { UsersTestManager } from 'test/helpers/users-tests-manager';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const { app: application, userTestManager } = await initSettings();

    app = application;
    userTestManger = userTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  const createUserBody: CreateUserDto = {
    login: 'user',
    password: 'user_pass',
    email: 'user@email.em',
  };

  it('should create user and return correct response', async () => {
    const response = await userTestManger.createUser(createUserBody);

    expect(response).toEqual({
      login: createUserBody.login,
      email: createUserBody.email,
      id: expect.any(String) as string,
      createdAt: expect.any(String) as string,
    });
  });

  it("should't create user with existing login", async () => {
    await userTestManger.createUser(createUserBody);
    const response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(createUserBody)
      .auth('admin', 'qwerty')
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

  it('should get user by id', async () => {
    const user = await userTestManger.createUser(createUserBody);
    const userById = await userTestManger.getUserById(user.id);

    expect(userById).toEqual(user);
  });

  it('should get users with paging', async () => {
    const users = await userTestManger.createSeveralUsers(12);
    const { body: responseBody } = (await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/users?pageNumber=2&sortDirection=asc`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.OK)) as { body: PaginatedViewDto<UserViewDto> };

    expect(responseBody.totalCount).toBe(12);
    expect(responseBody.items).toHaveLength(2);
    expect(responseBody.pagesCount).toBe(2);
    //asc sorting
    expect(responseBody.items[1]).toEqual(users.at(-1));
  });

  it('should delete user', async () => {
    const user = await userTestManger.createUser(createUserBody);
    await userTestManger.deleteUser(user.id);
    await userTestManger.getUserById(user.id, HttpStatus.NOT_FOUND);
  });

  it("should't delete user if user not found", async () => {
    await userTestManger.deleteUser(
      new mongoose.Types.ObjectId().toString(),
      HttpStatus.NOT_FOUND,
    );
  });

  it('should update user', async () => {
    const user = await userTestManger.createUser(createUserBody);
    const updatedUser = await userTestManger.updateUser(user.id, {
      email: 'updatedUser@email.em',
    });

    expect(updatedUser).toEqual({
      ...user,
      email: 'updatedUser@email.em',
    });
  });

  it("should't update user if user not found", async () => {
    await userTestManger.updateUser(
      new mongoose.Types.ObjectId().toString(),
      {
        email: 'updatedUser@email.em',
      },
      HttpStatus.NOT_FOUND,
    );
  });
});
