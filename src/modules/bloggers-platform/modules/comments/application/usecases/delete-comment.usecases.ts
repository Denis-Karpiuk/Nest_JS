import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';

export class DeleteCommentCommand {
  constructor(
    public readonly userId: string,
    public readonly commentId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(
      command.commentId,
    );

    if (comment.commentator?.id !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not allowed to delete this comment',
        extensions: [
          {
            field: 'commentId',
            message: 'You are not allowed to delete this comment',
          },
        ],
      });
    }

    await this.commentsRepository.deleteComment(command.commentId);
  }
}
