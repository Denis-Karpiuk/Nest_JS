import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { AuthQueryRepository } from '../../infrastructure/query/auth.query-repository';

export class GetMeQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetMeQuery)
export class GetMeQueryHandler implements IQueryHandler<GetMeQuery, MeViewDto> {
  constructor(private readonly authQueryRepository: AuthQueryRepository) {}

  async execute(query: GetMeQuery): Promise<MeViewDto> {
    return await this.authQueryRepository.me(query.id);
  }
}
