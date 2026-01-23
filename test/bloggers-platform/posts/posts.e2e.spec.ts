import { INestApplication } from '@nestjs/common';
import { CreatePostInputDto } from 'src/modules/bloggers-platform/modules/posts/api/input-dto/create-post.input.dto';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';
import { PostsTestManager } from 'test/helpers/posts-tests-manager';
import { BlogsTestManager } from 'test/helpers/blogs-tests-manager';

describe('Posts Controller (e2e)', () => {
  let app: INestApplication;
  let postTestManger: PostsTestManager;
  let blogTestManger: BlogsTestManager;

  beforeAll(async () => {
    const {
      app: application,
      postsTestManager,
      blogsTestManager,
    } = await initSettings();

    app = application;
    postTestManger = postsTestManager;
    blogTestManger = blogsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create new post and return correct response', async () => {
    // First create a blog
    const blog = await blogTestManger.createBlog({
      name: 'blog',
      description: 'blog_description',
      websiteUrl: 'https://blog.com',
    });

    // Create post with the blog ID
    const createPostBody: CreatePostInputDto = {
      title: 'post',
      content: 'post_content',
      blogId: blog.id,
      shortDescription: 'post_short_description',
    };

    const response = await postTestManger.createPost(createPostBody);

    expect(response).toMatchObject({
      title: createPostBody.title,
      content: createPostBody.content,
      blogId: createPostBody.blogId,
      shortDescription: createPostBody.shortDescription,
      blogName: blog.name,
      id: expect.any(String) as string,
      createdAt: expect.any(String) as string,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });
  });
});
