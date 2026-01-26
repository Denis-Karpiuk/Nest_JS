import { Types } from 'mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';

export class UpdateCommentCommand {
  constructor(
    public readonly commentId: Types.ObjectId,
    public readonly content: string,
    public readonly userId: Types.ObjectId,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(
      command.commentId,
    );

    if (comment.commentatorInfo.userId !== command.userId.toString()) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not allowed to update this comment',
        extensions: [
          {
            field: 'commentId',
            message: 'You are not allowed to update this comment',
          },
        ],
      });
    }

    comment.update(command.content);

    await this.commentsRepository.save(comment);
  }
}
