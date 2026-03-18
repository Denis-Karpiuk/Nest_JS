import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/users-accounts/guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';
import { ConnectPairGameCommand } from '../application/usecases/connect-game.usecase';
import { Game } from '../domain/game.entity';
import { AddAnswerCommand } from '../application/usecases/add-answer.usecase';
import { AnswerViewDto } from './view-dto/answer.view-dto';
import { AddAnswerInputDto } from './input-dto/add-answer.input.dto';
import { GetGameByIdQuery } from '../application/queries/get-game-by-id.query-handler';
import { GameViewDto } from './view-dto/game.view-dto';
import { GetUserCurrentGameQuery } from '../application/queries/get-user-current-game.query-handler';
import { UuidInputDto } from './input-dto/uuid.input.dto';

@Controller('pair-game-quiz/pairs')
export class PairsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async connectPairGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<Game> {
    return await this.commandBus.execute<ConnectPairGameCommand, Game>(
      new ConnectPairGameCommand({ playerId: user.id }),
    );
  }
  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  async getUserCurrentGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    return await this.queryBus.execute<GetUserCurrentGameQuery, GameViewDto>(
      new GetUserCurrentGameQuery(user.id),
    );
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async addAnswer(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() addAnswerInputDto: AddAnswerInputDto,
  ): Promise<AnswerViewDto> {
    return await this.commandBus.execute<AddAnswerCommand, AnswerViewDto>(
      new AddAnswerCommand({ ...addAnswerInputDto, userId: user.id }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getGameById(
    @Param('id', ParseUUIDPipe) id: UuidInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    return await this.queryBus.execute<GetGameByIdQuery, GameViewDto>(
      new GetGameByIdQuery({ gameId: id.id, userId: user.id }),
    );
  }
}
