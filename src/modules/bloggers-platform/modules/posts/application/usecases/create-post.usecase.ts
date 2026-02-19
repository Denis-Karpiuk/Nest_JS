import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../dto/create-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Post } from '../../domain/post.entity';

export class CreatePostCommand {
  constructor(public readonly dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  string
> {
  constructor(private readonly postsRepository: PostsRepository) {}
  async execute(command: CreatePostCommand): Promise<string> {
    const post = Post.createInstance(command.dto);

    await this.postsRepository.save(post);

    return post.id;
  }
}
