import { Injectable } from '@nestjs/common';
import { UsersExternalQueryRepository } from '../users-accounts/infrastructure/external-query/users.external-query-repository';
import { UsersExternalService } from '../users-accounts/aplication/users.external-service';

@Injectable()
export class BlogsService {
  constructor(
    private usersExternalRepository: UsersExternalQueryRepository,
    private usersExternalService: UsersExternalService,
  ) {
    console.log('BlogsService crated');
  }
  async hello(id: string) {
    const user = await this.usersExternalRepository.getByIdOrNotFoundFail(id);

    return 'Hello World!';
  }
}
