import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfig {
  constructor(private readonly configService: ConfigService<any, true>) {}

  get skipPasswordCheck(): boolean {
    return this.configService.get('SKIP_PASSWORD_CHECK') === 'true';
  }
}
