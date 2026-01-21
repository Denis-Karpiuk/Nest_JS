import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { AuthQueryRepository } from '../../infrastructure/query/auth.query-repository';

export class GetMeQuery {
  constructor(public readonly id: Types.ObjectId) {}
}

@QueryHandler(GetMeQuery)
export class GetMeQueryHandler implements IQueryHandler<GetMeQuery, MeViewDto> {
  constructor(private readonly authQueryRepository: AuthQueryRepository) {}

  async execute(query: GetMeQuery): Promise<MeViewDto> {
    return await this.authQueryRepository.me(query.id);
  }
}
