import { Controller, Get, Put, Post, Body, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ChannModerationService } from './chann-moderation.service';
import ModerateUsersDTO from './dto/moderate-users.dto';
import GetMemberIdDTO from './dto/get-member-id.dto';
import PendingApprovalsDTO from './dto/pending-approvals.dto';
import ApproveOrRejectDTO from './dto/approve-or-reject.dto';
import ModifyChannelDTO from './dto/modify-channel.dto';
import { Channel_pending } from '@prisma/client';

@Controller('chann-moderation')
export class ChannModerationController {
  constructor(private channModerationService: ChannModerationService){}

  @Get()
  async getMemberId(@Query() getMemberId: GetMemberIdDTO){
    const response: string = await this.channModerationService.getMemberId(getMemberId);
    return JSON.stringify({'message': response})
  }

  @Get('/:adminId/:chId')
  async pendingApprovals(@Param() pendingProp: PendingApprovalsDTO){
    const response: Channel_pending[] | null = await this.channModerationService.pendingApprovals(pendingProp);
    if (!response) {
      throw new HttpException('Validation Error!', HttpStatus.BAD_REQUEST);
    }
    return JSON.stringify(response)
  }

  @Put()
  async moderateUsers(@Body() moderateProp: ModerateUsersDTO){
    const response: string = await this.channModerationService.moderateUsers(moderateProp);
    return JSON.stringify({'message': response})
  }

  @Put('/:x/:x')
  async modifyChannel(@Body() newChannelProp: ModifyChannelDTO){
    const response: string = await this.channModerationService.modifyChannel(newChannelProp);
    return JSON.stringify({'message': response})
  }

  @Put('/:x')
  async approveOrReject(@Body() moderateProp: ApproveOrRejectDTO){
    const response: string = await this.channModerationService.approveOrReject(moderateProp);
    return JSON.stringify({'message': response})
  }

}
