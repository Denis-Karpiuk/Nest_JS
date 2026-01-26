import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import { Types } from 'mongoose';
import request from 'supertest';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { BlogsTestManager } from 'test/helpers/blogs-tests-manager';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';
import { PostsTestManager } from 'test/helpers/posts-tests-manager';
import { UsersTestManager } from 'test/helpers/users-tests-manager';

describe('Comments Controller (e2e)', () => {
  let app: INestApplication;
  let postTestManger: PostsTestManager;
  let blogTestManger: BlogsTestManager;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const {
      app: application,
      postsTestManager,
      blogsTestManager,
      userTestManager,
    } = await initSettings();

    app = application;
    postTestManger = postsTestManager;
    blogTestManger = blogsTestManager;
    userTestManger = userTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should delete post comment and return 204 status code', async () => {
    const blog = await blogTestManger.createBlog({
      name: 'blog',
      description: 'blog_description',
      websiteUrl: 'https://blog.com',
    });

    const post = await postTestManger.createPost({
      title: 'post',
      content: 'post_content',
      blogId: blog.id,
      shortDescription: 'post_short_description',
    });

    const newUser = {
      login: 'com_user',
      password: '123456789',
      email: 'com_user@test.com',
    };

    await userTestManger.createUser(newUser);

    const { accessToken } = await userTestManger.login(
      newUser.login,
      newUser.password,
    );

    const comment = await postTestManger.createComment(
      new Types.ObjectId(post.id),
      { content: 'comment_content' },
      accessToken,
    );

    await request(app.getHttpServer() as Server)
      .delete(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 403 Forbidden when user tries to delete comment of another user', async () => {
    const blog = await blogTestManger.createBlog({
      name: 'blog',
      description: 'blog_description',
      websiteUrl: 'https://blog.com',
    });

    const post = await postTestManger.createPost({
      title: 'post',
      content: 'post_content',
      blogId: blog.id,
      shortDescription: 'post_short_description',
    });

    // Create first user and comment
    const firstUser = {
      login: 'firstuser',
      password: '123456789',
      email: 'first_user@test.com',
    };

    await userTestManger.createUser(firstUser);

    const { accessToken: firstUserToken } = await userTestManger.login(
      firstUser.login,
      firstUser.password,
    );

    const comment = await postTestManger.createComment(
      new Types.ObjectId(post.id),
      { content: 'comment_content' },
      firstUserToken,
    );

    // Create second user
    const secondUser = {
      login: 'secondusr',
      password: '123456789',
      email: 'second_user@test.com',
    };

    await userTestManger.createUser(secondUser);

    const { accessToken: secondUserToken } = await userTestManger.login(
      secondUser.login,
      secondUser.password,
    );

    // Second user tries to delete first user's comment
    await request(app.getHttpServer() as Server)
      .delete(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(secondUserToken, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN);
  });
});
