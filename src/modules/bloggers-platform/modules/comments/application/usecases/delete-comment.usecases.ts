import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';

export class DeleteCommentCommand {
  constructor(
    public readonly userId: Types.ObjectId,
    public readonly commentId: Types.ObjectId,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(
      command.commentId,
    );

    if (comment.commentatorInfo.userId !== command.userId.toString()) {
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
