import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UpdatePostDto } from '../../dto/create-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    public readonly postId: Types.ObjectId,
    public readonly dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  Types.ObjectId
> {
  constructor(private readonly postsRepository: PostsRepository) {}
  async execute(command: UpdatePostCommand): Promise<Types.ObjectId> {
    const post = await this.postsRepository.findOrNotFoundFail(command.postId);

    post.update(command.dto);

    await this.postsRepository.save(post);

    return post._id;
  }
}
