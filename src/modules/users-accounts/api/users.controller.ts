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

import { UserViewDto } from './view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersService } from '../application/services/users.service';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/admins/create-user.usecase';
import { Types } from 'mongoose';
import { DeleteUserCommand } from '../application/usecases/admins/delete-user.usecase';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-transformation-pipe.service';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';
import { GetAllUsersQuery } from '../application/queries/get-all-users.query';

@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.commandBus.execute<
      CreateUserCommand,
      Types.ObjectId
    >(new CreateUserCommand(body));

    return this.usersQueryRepository.getByIdOrNotFoundFail(
      new Types.ObjectId(userId),
    );
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

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserViewDto> {
    return this.queryBus.execute<GetUserByIdQuery, UserViewDto>(
      new GetUserByIdQuery(new Types.ObjectId(id)),
    );
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserInputDto,
  ): Promise<UserViewDto> {
    const userId = await this.usersService.updateUser(
      new Types.ObjectId(id),
      body,
    );

    return this.usersQueryRepository.getByIdOrNotFoundFail(
      new Types.ObjectId(userId),
    );
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    await this.commandBus.execute<DeleteUserCommand>(
      new DeleteUserCommand(new Types.ObjectId(id)),
    );
  }
}
