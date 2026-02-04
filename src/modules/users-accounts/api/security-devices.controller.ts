import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { GetSecureDevicesQuery } from '../application/queries/get-secure-devices.query';
import { DeleteSecurityAllDevicesCommand } from '../application/usecases/security/delete-security-all-devices';
import { DeleteSecurityDeviceCommand } from '../application/usecases/security/delete-security-device';
import { ExtractUserFromRequest } from '../guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtRefreshAuthGuard } from '../guards/refresh/jwt-refresh-auth.guard';
import { SecureDevicesViewDto } from './view-dto/secure-devices.view-dto';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtRefreshAuthGuard)
  async getSecurityDevices(@ExtractUserFromRequest() user: UserContextDto) {
    const result = await this.queryBus.execute<
      GetSecureDevicesQuery,
      SecureDevicesViewDto
    >(new GetSecureDevicesQuery(new Types.ObjectId(user.id)));
    return result.devices;
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async deleteSecurityDevice(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('deviceId') deviceId: string,
  ) {
    return this.commandBus.execute<DeleteSecurityDeviceCommand, void>(
      new DeleteSecurityDeviceCommand(new Types.ObjectId(user.id), deviceId),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async deleteAllSecurityDevices(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
  ) {
    return this.commandBus.execute<DeleteSecurityAllDevicesCommand, void>(
      new DeleteSecurityAllDevicesCommand(
        new Types.ObjectId(user.id),
        req.cookies.refreshToken as string,
      ),
    );
  }
}
