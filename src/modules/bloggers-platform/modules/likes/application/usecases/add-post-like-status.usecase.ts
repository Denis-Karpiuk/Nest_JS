import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '../../domain/like.entity';
import { LikeStatusEnum } from '../../domain/dto/like-status-enum';
import { Repository } from 'typeorm';

export class AddPostLikeStatusCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly likeStatus: LikeStatusEnum,
  ) {}
}

@CommandHandler(AddPostLikeStatusCommand)
export class AddPostLikeUseCase implements ICommandHandler<
  AddPostLikeStatusCommand,
  void
> {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  async execute(command: AddPostLikeStatusCommand): Promise<void> {
    const existingLike = await this.likesRepository.findOne({
      where: {
        post: { id: command.postId },
        user: { id: command.userId },
      },
    });

    if (existingLike) {
      existingLike.update(command.likeStatus);
      await this.likesRepository.save(existingLike);
    }

    if (!existingLike) {
      const like = Like.createInstance({
        postId: command.postId,
        likeStatus: command.likeStatus,
        userId: command.userId,
      });

      await this.likesRepository.save(like);
    }
  }
}
