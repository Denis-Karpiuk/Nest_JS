import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecureDevicesViewDto } from '../../api/view-dto/secure-devices.view-dto';
import { SecurityDevicesQueryRepository } from '../../infrastructure/query/security-devices.query-repository';

export class GetSecureDevicesQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetSecureDevicesQuery)
export class GetSecureDevicesQueryHandler implements IQueryHandler<
  GetSecureDevicesQuery,
  SecureDevicesViewDto
> {
  constructor(
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
  ) {}

  async execute(query: GetSecureDevicesQuery): Promise<SecureDevicesViewDto> {
    return await this.securityDevicesQueryRepository.getSecureDevices(
      query.userId,
    );
  }
}
