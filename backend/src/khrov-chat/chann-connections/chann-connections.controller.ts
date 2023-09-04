import { Controller,  Get, Post, Put, Body, Param, ParseArrayPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ChannConnectionsService } from './chann-connections.service'
import ChannConnectionsDTO from './dto/chann-connections.dto';
import ChannHistoryDTO from './dto/chann-history.dto';
import UpdateChannDTO from './dto/update-chann.dto';
import SetSeenDTO from './dto/set-seen.dto';
import { Channel_link, Channel_history } from '@prisma/client';

@Controller('chann-connections')
export class ChannConnectionsController {
  constructor (private channConnectionsService: ChannConnectionsService) {}

  @Get('/:userId')
  async channConnections(@Param() user: ChannConnectionsDTO ){
    const connections: Channel_link[] = await this.channConnectionsService.channConnections(user.userId);
    return JSON.stringify(connections);
  }

  @Get('/:userId/:chId')
  async channHistory(@Param() channel: ChannHistoryDTO){
    const history: Channel_history[] | boolean = await this.channConnectionsService.channHistory(channel);
    if (history===false) {
      throw new HttpException('Unknown User/Channel Link', HttpStatus.BAD_REQUEST);
    }
    return JSON.stringify(history);
  }

  @Put()
  async updateChanns (@Body(new ParseArrayPipe({ items: UpdateChannDTO })) channPayload: UpdateChannDTO[]){
    await this.channConnectionsService.updateChanns(channPayload);
  }

  @Put('/:set-seen')
  async setSeen ( @Body() channDetails : SetSeenDTO ){
    await this.channConnectionsService.setSeen(channDetails);
  }
}
