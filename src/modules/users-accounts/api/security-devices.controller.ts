import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { GetSecureDevicesQuery } from '../application/queries/get-secure-devices.query';
import { DeleteSecurityAllDevicesCommand } from '../application/usecases/security/delete-security-all-devices';
import { DeleteSecurityDeviceCommand } from '../application/usecases/security/delete-security-device';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/params/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { SecureDevicesViewDto } from './view-dto/secure-devices.view-dto';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSecurityDevices(@ExtractUserFromRequest() user: UserContextDto) {
    return this.queryBus.execute<GetSecureDevicesQuery, SecureDevicesViewDto>(
      new GetSecureDevicesQuery(new Types.ObjectId(user.id)),
    );
  }

  @Delete(':deviceId')
  @UseGuards(JwtAuthGuard)
  async deleteSecurityDevice(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('deviceId') deviceId: string,
  ) {
    return this.commandBus.execute<DeleteSecurityDeviceCommand, void>(
      new DeleteSecurityDeviceCommand(new Types.ObjectId(user.id), deviceId),
    );
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
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
