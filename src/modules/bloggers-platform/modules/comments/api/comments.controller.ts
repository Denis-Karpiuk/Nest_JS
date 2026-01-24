import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query-handler';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { Types } from 'mongoose';

@Controller('comments')
export class CommentsController {
  constructor(private queryBus: QueryBus) {}

  @Get()
  async getCommentById(@Param('id') id: string) {
    return this.queryBus.execute<GetCommentByIdQuery, CommentViewDto>(
      new GetCommentByIdQuery(new Types.ObjectId(id)),
    );
  }
}
