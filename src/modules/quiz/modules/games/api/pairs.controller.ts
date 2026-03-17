import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/users-accounts/guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';
import { ConnectPairGameCommand } from '../application/usecases/connect-game.usecase';
import { Game } from '../domain/game.entity';
import { AddAnswerCommand } from '../application/usecases/add-answer.usecase';
import { AnswerViewDto } from './view-dto/answer.view-dto';
import { AddAnswerInputDto } from './input-dto/add-answer.input.dto';

@Controller('pair-game-quiz/pairs')
export class PairsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('connection')
  @UseGuards(JwtAuthGuard)
  async connectPairGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<Game> {
    return await this.commandBus.execute<ConnectPairGameCommand, Game>(
      new ConnectPairGameCommand({ playerId: user.id }),
    );
  }
  @Post('my-current/answers')
  @UseGuards(JwtAuthGuard)
  async addAnswer(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() addAnswerInputDto: AddAnswerInputDto,
  ): Promise<AnswerViewDto> {
    return await this.commandBus.execute<AddAnswerCommand, AnswerViewDto>(
      new AddAnswerCommand({ ...addAnswerInputDto, userId: user.id }),
    );
  }
}
