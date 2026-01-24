import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from 'src/modules/bloggers-platform/modules/posts/api/input-dto/create-post.input.dto';
import { PostsViewDto } from 'src/modules/bloggers-platform/modules/posts/api/view-dto/posts.view-dto';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';
import { PostsTestManager } from 'test/helpers/posts-tests-manager';
import { BlogsTestManager } from 'test/helpers/blogs-tests-manager';
import { UsersTestManager } from 'test/helpers/users-tests-manager';
import { Types } from 'mongoose';
import { CreatePostCommentInputDto } from 'src/modules/bloggers-platform/modules/posts/api/input-dto/create-post-comment.input.dto';

describe('Posts Controller (e2e)', () => {
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

  it('should update post and return correct response', async () => {
    const blog = await blogTestManger.createBlog({
      name: 'blog',
      description: 'blog_description',
      websiteUrl: 'https://blog.com',
    });

    const createPostBody: CreatePostInputDto = {
      title: 'post',
      content: 'post_content',
      blogId: blog.id,
      shortDescription: 'post_short_description',
    };

    const post = await postTestManger.createPost(createPostBody);

    const updatePostBody: UpdatePostInputDto = {
      title: 'updated_post',
      content: 'updated_post_content',
      blogId: blog.id,
      shortDescription: 'updated_post_short_description',
    };

    await postTestManger.updatePost(
      new Types.ObjectId(post.id),
      updatePostBody,
    );

    // Fetch the updated post to verify changes
    const updatedPost = await postTestManger.getPost(
      new Types.ObjectId(post.id),
    );

    expect(updatedPost).toMatchObject({
      title: updatePostBody.title,
      content: updatePostBody.content,
      blogId: updatePostBody.blogId,
      shortDescription: updatePostBody.shortDescription,
    });

    expect(updatedPost).not.toMatchObject({
      title: createPostBody.title,
      content: createPostBody.content,
    });
  });

  it('should delete post and return correct response', async () => {
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

    const post = await postTestManger.createPost(createPostBody);

    await postTestManger.deletePost(new Types.ObjectId(post.id));

    await postTestManger.getPost(
      new Types.ObjectId(post.id),
      HttpStatus.NOT_FOUND,
    );
  });

  it('should get all posts and return correct response', async () => {
    // Create a blog first
    const blog = await blogTestManger.createBlog({
      name: 'blog',
      description: 'blog_description',
      websiteUrl: 'https://blog.com',
    });

    // Create 10 posts in batches to avoid connection issues
    const createdPosts: PostsViewDto[] = [];
    const batchSize = 5;

    for (let batch = 0; batch < 2; batch++) {
      const batchPromises = Array.from({ length: batchSize }, (_, i) => {
        const index = batch * batchSize + i + 1;
        return postTestManger.createPost({
          title: `post_${index}`,
          content: `post_content_${index}`,
          blogId: blog.id,
          shortDescription: `post_short_description_${index}`,
        });
      });

      const batchResults = await Promise.all(batchPromises);
      createdPosts.push(...batchResults);
    }

    // Get all posts
    const response = await postTestManger.getAllPosts();

    // Verify response structure
    expect(response.pagesCount).toBe(1);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
    expect(response.totalCount).toBe(10);
    expect(response.items).toHaveLength(10);

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

  it('should create post comment and return correct response', async () => {
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

    const createCommentBody: CreatePostCommentInputDto = {
      content: 'comment_content',
    };

    const response = await postTestManger.createComment(
      new Types.ObjectId(post.id),
      createCommentBody,
      accessToken,
    );

    expect(response).toMatchObject({
      content: createCommentBody.content,
      postId: post.id,
      commentatorInfo: {
        userId: expect.any(String) as string,
        userLogin: expect.any(String) as string,
      },
      id: expect.any(String) as string,
      createdAt: expect.any(String) as string,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
  });
});
