import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { UsersQueryRepository } from '../../infrastructure/query/users.query-repository';

export class GetAllUsersQuery {
  constructor(public readonly params: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<
  GetAllUsersQuery,
  PaginatedViewDto<UserViewDto[]>
> {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute(
    query: GetAllUsersQuery,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query.params);
  }
}
