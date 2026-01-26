import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Like, type LikeModelType } from '../../domain/like.entity';
import { EntityType } from '../../domain/dto/entity-type.enum';
import { LikeStatusEnum } from '../../domain/dto/like-status-enum';

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
    @InjectModel(Like.name)
    private readonly LikeModel: LikeModelType,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute(command: AddPostLikeStatusCommand): Promise<void> {
    const existingLike = await this.likesRepository.findByEntityAndUser(
      command.postId,
      EntityType.Post,
      command.userId,
    );

    if (existingLike) {
      existingLike.update(command.likeStatus);
      await this.likesRepository.save(existingLike);
    }

    if (!existingLike) {
      const like = this.LikeModel.createInstance({
        entityId: command.postId,
        entityType: EntityType.Post,
        likeStatus: command.likeStatus,
        userId: command.userId,
      });

      await this.likesRepository.save(like);
    }
  }
}
