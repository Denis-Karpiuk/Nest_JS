import { Injectable } from '@nestjs/common';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Post } from '../domain/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findById(id: string): Promise<Post | null> {
    return this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blog', 'blog')
      .where('post.id = :id', { id })
      .getOne();
  }

  async findOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.findById(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [
          {
            field: 'postId',
            message: 'Post not found',
          },
        ],
      });
    }

    return post;
  }

  async deletePost(
    id: string,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const result = await this.postsRepository.delete({ id });
    return {
      acknowledged: true,
      deletedCount: result.affected ?? 0,
    };
  }

  async save(post: Post) {
    await this.postsRepository.save(post);
  }

  async countPosts(): Promise<number> {
    return this.postsRepository.count();
  }

  async findPaginated(options: {
    order: Record<string, 'ASC' | 'DESC'>;
    skip: number;
    take: number;
    blogId?: string;
  }): Promise<Post[]> {
    return this.postsRepository.find({
      where: options.blogId ? { blog: { id: options.blogId } } : undefined,
      order: options.order,
      skip: options.skip,
      take: options.take,
      relations: ['blog'],
    });
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['blog'] });
  }

  async countPostsByBlogId(blogId: string): Promise<number> {
    return this.postsRepository.count({ where: { blog: { id: blogId } } });
  }
}
