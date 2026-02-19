import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { FindOptionsWhere, IsNull, Like, Repository } from 'typeorm';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const where: FindOptionsWhere<User> = {
      deletedAt: IsNull(),
    };
    if (query.searchLoginTerm) {
      where.login = Like(`%${query.searchLoginTerm}%`);
    }

    if (query.searchEmailTerm) {
      where.email = Like(`%${query.searchEmailTerm}%`);
    }

    const users = await this.userRepository.find({
      where,
      skip: query.calculateSkip(),
      take: query.pageSize,
      order: {
        [query.sortBy]: query.sortDirection,
      },
    });

    const totalCount = await this.userRepository.count({
      where: { deletedAt: IsNull() },
    });

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
