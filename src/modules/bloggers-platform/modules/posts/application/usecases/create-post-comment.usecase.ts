import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsExternalService } from '../../../comments/application/external/comments.external-service';
import { CreatePostCommentDto } from '../../dto/create-post-comment.dto';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';

export class CreatePostCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly dto: CreatePostCommentDto,
    public readonly user: UserContextDto,
  ) {}
}

@CommandHandler(CreatePostCommentCommand)
export class CreatePostCommentUseCase implements ICommandHandler<
  CreatePostCommentCommand,
  string
> {
  constructor(
    private readonly commentsExternalService: CommentsExternalService,
  ) {}

  async execute(command: CreatePostCommentCommand) {
    return await this.commentsExternalService.createComment({
      postId: command.postId,
      content: command.dto.content,
      commentatorId: command.user.id,
    });
  }
}
