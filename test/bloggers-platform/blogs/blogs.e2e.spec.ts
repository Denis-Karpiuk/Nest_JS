import { HttpStatus, INestApplication } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateBlogDto } from 'src/modules/bloggers-platform/modules/blogs/dto/create-blog.dto';
import { BlogViewDto } from 'src/modules/bloggers-platform/modules/blogs/api/view-dto/blogs.view-dto';
import { BlogsTestManager } from 'test/helpers/blogs-tests-manager';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';
import { CreateBlogPostDto } from 'src/modules/bloggers-platform/modules/blogs/api/input-dto/creat-blog-post.dto';

describe('Blogs Controller (e2e)', () => {
  let app: INestApplication;
  let blogTestManger: BlogsTestManager;

  beforeAll(async () => {
    const { app: application, blogsTestManager } = await initSettings();

    app = application;
    blogTestManger = blogsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

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
      isMembership: false,
    });
  });

  it('should not create blog if passed body is incorrect', async () => {
    await blogTestManger.createBlog(
      {
        nam: 'blog',
        description: 'blog_description',
        websiteUrl: 'https://blog.com',
      } as any,
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should get all blogs and return correct response', async () => {
    // Create 10 blogs
    const createdBlogs: BlogViewDto[] = [];
    for (let i = 1; i <= 10; i++) {
      const blog = await blogTestManger.createBlog({
        name: `blog_${i}`,
        description: `blog_description_${i}`,
        websiteUrl: `https://blog${i}.com`,
      });
      createdBlogs.push(blog);
    }

    // Get all blogs
    const response = await blogTestManger.getAllBlogs();

    // Verify response structure
    expect(response.pagesCount).toBe(1);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
    expect(response.totalCount).toBe(10);
    expect(response.items).toHaveLength(10);

    // Verify all created blogs are in the response
    const createdBlogIds = new Set(createdBlogs.map((blog) => blog.id));
    const responseBlogIds = new Set(response.items.map((blog) => blog.id));
    expect(responseBlogIds).toEqual(createdBlogIds);

    // Verify each blog has correct structure
    for (const blog of response.items) {
      expect(blog).toMatchObject({
        id: expect.any(String) as string,
        name: expect.any(String) as string,
        description: expect.any(String) as string,
        websiteUrl: expect.any(String) as string,
        createdAt: expect.any(String) as string,
        isMembership: false,
      });
    }
  });

  it('should update blog and return 204 status code', async () => {
    const blog = await blogTestManger.createBlog(createBlogBody);

    await blogTestManger.updateBlog(
      createBlogBody,
      new Types.ObjectId(blog.id),
    );
  });

  it('should not update blog if it not found', async () => {
    await blogTestManger.updateBlog(
      createBlogBody,
      new Types.ObjectId(),
      HttpStatus.NOT_FOUND,
    );
  });

  it('should delete blog and return 204 status code', async () => {
    const blog = await blogTestManger.createBlog(createBlogBody);

    await blogTestManger.deleteBlog(new Types.ObjectId(blog.id));
  });

  it('should not delete blog if it not found', async () => {
    await blogTestManger.deleteBlog(new Types.ObjectId(), HttpStatus.NOT_FOUND);
  });

  it('should create post and return correct response', async () => {
    const blog = await blogTestManger.createBlog(createBlogBody);

    const createPostBody: CreateBlogPostDto = {
      title: 'post',
      shortDescription: 'post_short_description',
      content: 'post_content',
    };

    const response = await blogTestManger.createPost(
      new Types.ObjectId(blog.id),
      createPostBody,
    );

    expect(response).toMatchObject({
      title: createPostBody.title,
      shortDescription: createPostBody.shortDescription,
      content: createPostBody.content,
      blogId: blog.id,
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

  it('should get posts by blog id and return correct response', async () => {
    const blog = await blogTestManger.createBlog(createBlogBody);

    // Create 5 posts
    const createdPosts = [];
    for (let i = 1; i <= 5; i++) {
      const post = await blogTestManger.createPost(
        new Types.ObjectId(blog.id),
        {
          title: `post_${i}`,
          shortDescription: `post_short_description_${i}`,
          content: `post_content_${i}`,
        },
      );
      createdPosts.push(post);
    }

    // Get all posts by blog ID
    const response = await blogTestManger.getPostsByBlogId(
      new Types.ObjectId(blog.id),
    );

    // Verify response structure
    expect(response.pagesCount).toBe(1);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
    expect(response.totalCount).toBe(5);
    expect(response.items).toHaveLength(5);

    // Verify all created posts are in the response
    const createdPostIds = new Set(createdPosts.map((post) => post.id));
    const responsePostIds = new Set(response.items.map((post) => post.id));
    expect(responsePostIds).toEqual(createdPostIds);

    // Verify each post has correct structure
    for (const post of response.items) {
      expect(post).toMatchObject({
        id: expect.any(String) as string,
        title: expect.any(String) as string,
        content: expect.any(String) as string,
        blogId: blog.id,
        shortDescription: expect.any(String) as string,
        blogName: blog.name,
        createdAt: expect.any(String) as string,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    }
  });
});
