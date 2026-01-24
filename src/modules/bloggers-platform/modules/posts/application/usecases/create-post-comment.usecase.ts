import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CommentsExternalService } from '../../../comments/application/external/comments.external-service';
import { CreatePostCommentDto } from '../../dto/create-post-comment.dto';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';

export class CreatePostCommentCommand {
  constructor(
    public readonly postId: Types.ObjectId,
    public readonly dto: CreatePostCommentDto,
    public readonly user: UserContextDto,
  ) {}
}

@CommandHandler(CreatePostCommentCommand)
export class CreatePostCommentUseCase implements ICommandHandler<
  CreatePostCommentCommand,
  Types.ObjectId
> {
  constructor(
    private readonly commentsExternalService: CommentsExternalService,
  ) {}

  async execute(command: CreatePostCommentCommand) {
    return await this.commentsExternalService.createComment({
      postId: command.postId.toString(),
      content: command.dto.content,
      commentatorInfo: {
        userId: command.user.id,
        userLogin: command.user.login,
      },
    });
  }
}
