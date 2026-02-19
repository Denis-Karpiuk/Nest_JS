import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetAllUsersQuery } from '../application/queries/get-all-users.query';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';
import { CreateUserCommand } from '../application/usecases/admin/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/admin/delete-user.usecase';
import { UpdateUserCommand } from '../application/usecases/update-user.usecase';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { UserViewDto } from './view-dto/users.view-dto';

@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand(body),
    );

    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.queryBus.execute<
      GetAllUsersQuery,
      PaginatedViewDto<UserViewDto[]>
    >(new GetAllUsersQuery(query));
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserViewDto> {
    return this.queryBus.execute<GetUserByIdQuery, UserViewDto>(
      new GetUserByIdQuery(id),
    );
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserInputDto,
  ): Promise<UserViewDto> {
    await this.commandBus.execute<UpdateUserCommand, string>(
      new UpdateUserCommand(id, body),
    );

    return this.usersQueryRepository.getByIdOrNotFoundFail(id);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute<DeleteUserCommand>(new DeleteUserCommand(id));
  }
}
