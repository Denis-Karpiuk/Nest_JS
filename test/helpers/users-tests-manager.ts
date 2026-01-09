import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import {
  MeViewDto,
  UserViewDto,
} from 'src/modules/users-accounts/api/view-dto/users.view-dto';
import { CreateUserInputDto } from 'src/modules/users-accounts/api/input-dto/create-user.input-dto';
import { UpdateUserInputDto } from 'src/modules/users-accounts/api/input-dto/update-user.input-dto';
import { delay } from './delay';

export class UsersTestManager {
  constructor(private readonly app: INestApplication) {}

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as UserViewDto;
  }

  async deleteUser(
    userId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/users/${userId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async getUserById(
    userId: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/users/${userId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as UserViewDto;
  }

  async updateUser(
    userId: string,
    updateModel: UpdateUserInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/users/${userId}`)
      .send(updateModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as UserViewDto;
  }

  async registration(
    registrationModel: CreateUserInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send(registrationModel)
      .expect(statusCode);
  }

  async login(
    login: string,
    password: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<{ accessToken: string }> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ login, password })
      .expect(statusCode);

    const body = response.body as { accessToken: string };

    return {
      accessToken: body.accessToken,
    };
  }

  async me(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<MeViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);

    return response.body as MeViewDto;
  }

  async createSeveralUsers(count: number): Promise<UserViewDto[]> {
    const usersPromises = [] as Promise<UserViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const response = this.createUser({
        login: `test` + i,
        email: `test${i}@gmail.com`,
        password: '123456789',
      });
      usersPromises.push(response);
    }

    return Promise.all(usersPromises);
  }

  async createAndLoginSeveralUsers(
    count: number,
  ): Promise<{ accessToken: string }[]> {
    const users = await this.createSeveralUsers(count);

    const loginPromises = users.map((user: UserViewDto) =>
      this.login(user.login, '123456789'),
    );

    return await Promise.all(loginPromises);
  }
}
