import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Types } from 'mongoose';

export class DeleteBlogCommand {
  constructor(public readonly blogId: Types.ObjectId) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    await this.blogsRepository.findOrNotFoundFail(command.blogId);

    await this.blogsRepository.deleteBlog(command.blogId);
  }
}
