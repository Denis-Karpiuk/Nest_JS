import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from '../../domain/like.entity';
import { EntityType } from '../../domain/dto/entity-type.enum';
import { LikeStatusEnum } from '../../domain/dto/like-status-enum';
import { Repository } from 'typeorm';

export class AddCommentLikeStatusCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly likeStatus: LikeStatusEnum,
  ) {}
}

@CommandHandler(AddCommentLikeStatusCommand)
export class AddCommentLikeUseCase implements ICommandHandler<
  AddCommentLikeStatusCommand,
  void
> {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  async execute(command: AddCommentLikeStatusCommand): Promise<void> {
    const existingLike = await this.likesRepository.findOne({
      where: {
        entityId: command.commentId,
        entityType: EntityType.Comment,
        userId: command.userId,
      },
    });

    if (existingLike) {
      existingLike.update(command.likeStatus);
      await this.likesRepository.save(existingLike);
    }

    if (!existingLike) {
      const like = Like.createInstance({
        entityId: command.commentId,
        entityType: EntityType.Comment,
        likeStatus: command.likeStatus,
        userId: command.userId,
      });

      await this.likesRepository.save(like);
    }
  }
}
