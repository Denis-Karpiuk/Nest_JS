import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '../../domain/like.entity';
import { EntityType } from '../../domain/dto/entity-type.enum';
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
        entityId: command.postId,
        entityType: EntityType.Post,
        userId: command.userId,
      },
    });

    if (existingLike) {
      existingLike.update(command.likeStatus);
      await this.likesRepository.save(existingLike);
    }

    if (!existingLike) {
      const like = Like.createInstance({
        entityId: command.postId,
        entityType: EntityType.Post,
        likeStatus: command.likeStatus,
        userId: command.userId,
      });

      await this.likesRepository.save(like);
    }
  }
}
