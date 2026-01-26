import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query-handler';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { Types } from 'mongoose';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecases';
import { ObjectIdValidationPipe } from 'src/core/pipes/object-id-validation-transformation-pipe.service';
import { JwtAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/users-accounts/guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getCommentById(@Param('id') id: string) {
    return this.queryBus.execute<GetCommentByIdQuery, CommentViewDto>(
      new GetCommentByIdQuery(new Types.ObjectId(id)),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute<DeleteCommentCommand, void>(
      new DeleteCommentCommand(new Types.ObjectId(user.id), id),
    );
  }
}
