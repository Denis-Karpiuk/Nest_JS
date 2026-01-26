import { HttpStatus, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import { Types } from 'mongoose';
import request from 'supertest';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { CommentViewDto } from 'src/modules/bloggers-platform/modules/comments/api/view-dto/comment.view-dto';
import { BlogsTestManager } from 'test/helpers/blogs-tests-manager';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { delay } from 'test/helpers/delay';
import { initSettings } from 'test/helpers/init-settings';
import { PostsTestManager } from 'test/helpers/posts-tests-manager';
import { UsersTestManager } from 'test/helpers/users-tests-manager';

describe('Comments Controller (e2e)', () => {
  let app: INestApplication;
  let postTestManger: PostsTestManager;
  let blogTestManger: BlogsTestManager;
  let userTestManger: UsersTestManager;

  let blog: { id: string; name: string };
  let post: { id: string };
  let commentOwner: { login: string; password: string; email: string };
  let accessToken: string;
  let comment: CommentViewDto;

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

    blog = await blogTestManger.createBlog({
      name: 'blog',
      description: 'blog_description',
      websiteUrl: 'https://blog.com',
    });

    post = await postTestManger.createPost({
      title: 'post',
      content: 'post_content',
      blogId: blog.id,
      shortDescription: 'post_short_description',
    });

    commentOwner = {
      login: 'com_user',
      password: '123456789',
      email: 'com_user@test.com',
    };

    await userTestManger.createUser(commentOwner);

    const loginResult = await userTestManger.login(
      commentOwner.login,
      commentOwner.password,
    );
    accessToken = loginResult.accessToken;

    // Add delay to avoid throttling between tests
    await delay(200);

    comment = await postTestManger.createComment(
      new Types.ObjectId(post.id),
      { content: 'comment_content' },
      accessToken,
    );
  });

  it('should delete post comment and return 204 status code', async () => {
    await request(app.getHttpServer() as Server)
      .delete(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 403 Forbidden when user tries to delete comment of another user', async () => {
    const otherUser = {
      login: 'secondusr',
      password: '123456789',
      email: 'second_user@test.com',
    };

    await userTestManger.createUser(otherUser);

    // Add delay to avoid throttling
    await delay(500);

    const { accessToken: otherUserToken } = await userTestManger.login(
      otherUser.login,
      otherUser.password,
    );

    await request(app.getHttpServer() as Server)
      .delete(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(otherUserToken, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('should update comment and return 204 status code', async () => {
    await request(app.getHttpServer() as Server)
      .put(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ content: 'updated_comment_content' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 403 Forbidden when user tries to update comment of another user', async () => {
    // Wait to reset throttle counter from previous tests
    await delay(11000);

    const otherUser = {
      login: 'secondusr',
      password: '123456789',
      email: 'second_user@test.com',
    };

    await userTestManger.createUser(otherUser);

    const { accessToken: otherUserToken } = await userTestManger.login(
      otherUser.login,
      otherUser.password,
    );

    await request(app.getHttpServer() as Server)
      .put(`/${GLOBAL_PREFIX}/comments/${comment.id}`)
      .auth(otherUserToken, { type: 'bearer' })
      .send({ content: 'updated_comment_content' })
      .expect(HttpStatus.FORBIDDEN);
  }, 15000);
});
