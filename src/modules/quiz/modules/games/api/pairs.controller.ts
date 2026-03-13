import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtOptionalAuthGuard } from 'src/modules/users-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/users-accounts/guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/users-accounts/guards/dto/user-context.dto';
import { ConnectPairGameCommand } from '../application/usecases/connect-game.usecase';
import { Game } from '../domain/game.entity';

@Controller('pair-game-quiz/pairs')
export class PairsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('connection')
  @UseGuards(JwtOptionalAuthGuard)
  async connectPairGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<Game> {
    return await this.commandBus.execute<ConnectPairGameCommand, Game>(
      new ConnectPairGameCommand({ playerId: user.id }),
    );
  }
}
