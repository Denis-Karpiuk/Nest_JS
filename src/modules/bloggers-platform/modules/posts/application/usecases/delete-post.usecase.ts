import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public readonly postId: Types.ObjectId) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    await this.postsRepository.findOrNotFoundFail(command.postId);

    await this.postsRepository.deletePost(command.postId);
  }
}
