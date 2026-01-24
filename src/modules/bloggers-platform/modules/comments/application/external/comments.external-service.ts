import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { CreateCommentDomainDto } from '../../domain/dto/create-comment.domain.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Types } from 'mongoose';

@Injectable()
export class CommentsExternalService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentsModel: CommentModelType,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async createComment(dto: CreateCommentDomainDto): Promise<Types.ObjectId> {
    const comment = this.commentsModel.createInstance(dto);

    await this.commentsRepository.save(comment);

    return comment._id;
  }
}
