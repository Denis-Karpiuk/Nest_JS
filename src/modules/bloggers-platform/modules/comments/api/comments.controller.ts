import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { ObjectIdValidationPipe } from 'src/core/pipes/object-id-validation-transformation-pipe.service';
import { JwtAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-auth.guard';
import { JwtOptionalAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/users-accounts/guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';
import { AddCommentLikeStatusCommand } from '../../likes/application/usecases/add-comment-like-status.usecase';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query-handler';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecases';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { LikeCommentInputDto } from './input-dto/like-comment.input.dto';
import { UpdateCommentInputDto } from './input-dto/update-comment.input.dto';
import { CommentViewDto } from './view-dto/comment.view-dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getCommentById(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @ExtractUserFromRequest() user: UserContextDto | null,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute<GetCommentByIdQuery, CommentViewDto>(
      new GetCommentByIdQuery(id, user?.id),
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

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @Body() dto: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(id, dto.content, new Types.ObjectId(user.id)),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeComment(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @Body() dto: LikeCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.queryBus.execute<GetCommentByIdQuery, CommentViewDto>(
      new GetCommentByIdQuery(id),
    );
    await this.commandBus.execute<AddCommentLikeStatusCommand, void>(
      new AddCommentLikeStatusCommand(
        id.toString(),
        new Types.ObjectId(user.id).toString(),
        dto.likeStatus,
      ),
    );
  }
}
