import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get()
  async getCommentById(@Param('id') id: string) {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
  }
}
