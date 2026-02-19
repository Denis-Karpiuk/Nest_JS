import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Repository } from 'typeorm';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UsersSortBy } from '../../api/input-dto/users-sort-by';
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
    const conditions: string[] = [];
    const params: Record<string, string> = {};
    if (query.searchLoginTerm) {
      conditions.push('user.login ILIKE :loginTerm');
      params.loginTerm = `%${query.searchLoginTerm}%`;
    }
    if (query.searchEmailTerm) {
      conditions.push('user.email ILIKE :emailTerm');
      params.emailTerm = `%${query.searchEmailTerm}%`;
    }
    const searchWhere =
      conditions.length > 0
        ? conditions.length > 1
          ? `(${conditions.join(' OR ')})`
          : conditions[0]
        : null;

    const baseQb = () => {
      const qb = this.userRepository
        .createQueryBuilder('user')
        .where('user.deletedAt IS NULL');
      if (searchWhere) {
        qb.andWhere(searchWhere, params);
      }
      return qb;
    };

    const totalCount = await baseQb().getCount();

    const orderColumn =
      query.sortBy === UsersSortBy.CreatedAt
        ? 'user.createdAt'
        : `user.${query.sortBy} COLLATE "C"`;

    const users = await baseQb()
      .orderBy(orderColumn, query.sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(query.calculateSkip())
      .take(query.pageSize)
      .getMany();

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
