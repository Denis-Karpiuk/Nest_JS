import { INestApplication } from '@nestjs/common';
import { CreateBlogDto } from 'src/modules/bloggers-platform/modules/blogs/dto/create-blog.dto';
import { BlogsTestManager } from 'test/helpers/blogs-tests-manager';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';

describe('Blogs Controller (e2e)', () => {
  let app: INestApplication;
  // let userTestManger: UsersTestManager;
  let blogTestManger: BlogsTestManager;

  beforeAll(async () => {
    const {
      app: application,
      // userTestManager,
      blogsTestManager,
    } = await initSettings();

    app = application;
    // userTestManger = userTestManager;
    blogTestManger = blogsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  // const createUserBody: CreateUserDto = {
  //   login: 'user',
  //   password: 'user_pass',
  //   email: 'user@email.em',
  // };

  const createBlogBody: CreateBlogDto = {
    name: 'blog',
    description: 'blog_description',
    websiteUrl: 'https://blog.com',
  };

  it('should create new blog and return correct response', async () => {
    const response = await blogTestManger.createBlog(createBlogBody);

    expect(response).toEqual({
      name: createBlogBody.name,
      description: createBlogBody.description,
      websiteUrl: createBlogBody.websiteUrl,
      id: expect.any(String) as string,
      createdAt: expect.any(String) as string,
      isMembership: true,
    });
  });

  it('should update blog and return 204 status code', async () => {
    const blog = await blogTestManger.createBlog(createBlogBody);

    await blogTestManger.updateBlog(createBlogBody, blog.id);
  });
});
