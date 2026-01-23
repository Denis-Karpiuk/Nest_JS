import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../dto/create-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post.entity';
import { Types } from 'mongoose';

export class CreatePostCommand {
  constructor(public readonly dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  Types.ObjectId
> {
  constructor(
    @InjectModel(Post.name)
    private readonly PostModel: PostModelType,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute(command: CreatePostCommand): Promise<Types.ObjectId> {
    const post = this.PostModel.createInstance(command.dto);

    await this.postsRepository.save(post);

    return post._id;
  }
}
