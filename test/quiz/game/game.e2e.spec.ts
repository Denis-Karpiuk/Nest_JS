import { INestApplication } from '@nestjs/common';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';
import { QuestionsTestManager } from 'test/helpers/questions-tests-manager';
import { UsersTestManager } from 'test/helpers/users-tests-manager';
import request from 'supertest';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import type { Server } from 'http';

type CurrentGameResponse = {
  id: string;
};

type GameByIdResponse = {
  status: string;
  finishGameDate: string | null;
  firstPlayerProgress: { score: number };
  secondPlayerProgress: { score: number };
};

describe('Game Controller (e2e)', () => {
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const settings = await initSettings();
    app = settings.app;
    questionsTestManager = settings.questionsTestManager;
    usersTestManager = settings.userTestManager;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('POST -> "/pair-game-quiz/pairs/my-current/answers", GET -> "/pair-game-quiz/pairs": create game by user1, connect to game by user2. Add 5 correct answers by user1. Await 10 sec. Get game by user1. Should return finished game - status: "Finished", firstPlayerProgress.score: 6, secondPlayerProgress.score: 0, finishGameDate: not to be null; status 200;', async () => {
    const questionBodies = [
      'q1 body body body body',
      'q2 body body body body',
      'q3 body body body body',
      'q4 body body body body',
      'q5 body body body body',
    ];

    for (let i = 0; i < questionBodies.length; i++) {
      const created = await questionsTestManager.createQuestion({
        body: questionBodies[i],
        correctAnswers: ['ok'],
      });
      await questionsTestManager.publishQuestion(created.id, {
        published: true,
      });
    }

    const user1 = await usersTestManager.createUser({
      login: 'user1',
      email: 'user1@mail.com',
      password: '123456789',
    });
    const user2 = await usersTestManager.createUser({
      login: 'user2',
      email: 'user2@mail.com',
      password: '123456789',
    });

    const user1Token = (await usersTestManager.login(user1.login, '123456789'))
      .accessToken;
    const user2Token = (await usersTestManager.login(user2.login, '123456789'))
      .accessToken;

    await request(app.getHttpServer() as Server)
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/connection`)
      .auth(user1Token, { type: 'bearer' })
      .expect(200);

    await request(app.getHttpServer() as Server)
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/connection`)
      .auth(user2Token, { type: 'bearer' })
      .expect(200);

    const currentGameResponse = await request(app.getHttpServer() as Server)
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current`)
      .auth(user1Token, { type: 'bearer' })
      .expect(200);

    const currentGameBody = currentGameResponse.body as CurrentGameResponse;
    const gameId = currentGameBody.id;
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer() as Server)
        .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
        .auth(user1Token, { type: 'bearer' })
        .send({ answer: 'ok' })
        .expect(200);
    }

    await new Promise((resolve) => setTimeout(resolve, 10_300));

    const gameById = await request(app.getHttpServer() as Server)
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/${gameId}`)
      .auth(user1Token, { type: 'bearer' })
      .expect(200);

    const gameByIdBody = gameById.body as GameByIdResponse;
    expect(gameByIdBody.status).toBe('Finished');
    expect(gameByIdBody.finishGameDate).not.toBeNull();
    expect(gameByIdBody.firstPlayerProgress.score).toBe(6);
    expect(gameByIdBody.secondPlayerProgress.score).toBe(0);
  }, 30_000);
});
