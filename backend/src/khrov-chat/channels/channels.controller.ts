import { Body, Param, Controller, Post, Put, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import AddChannelDTO from './dto/add-channel.dto';
import SuggestedChannelsDTO from './dto/suggested-channels.dto';
import SearchChannelsDTO from './dto/search-channels.dto';
import { ErrorValue } from './enums/error-value.enum';
import JoinOrExitChannelDTO from './dto/join-or-exit-channel.dto';

@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService){}

  @Get('/:userId')
  async suggestedChannels(@Param() user: SuggestedChannelsDTO){
    const response: object | ErrorValue = await this.channelsService.suggestedChannels(user.userId);
    if (response===ErrorValue.NO_USER) {
      throw new HttpException('Unable To Find User Details!', HttpStatus.BAD_REQUEST);
    }
    return JSON.stringify(response);
  }

  @Get('/:userId/:key') 
  async searchChannels( @Param() details: SearchChannelsDTO ){
    const output = await this.channelsService.searchChannels(details);
    return JSON.stringify(output);
  }

  @Post()
  async addChannel(@Body() channelProp: AddChannelDTO){
    const response: ErrorValue = await this.channelsService.addChannel(channelProp);
    switch (response){
      case ErrorValue.NO_USER:
        throw new HttpException('Unable To Find User Details!', HttpStatus.BAD_REQUEST);
      case ErrorValue.CHANNEL_EXISTS:
        throw new HttpException('Channel Name Already Taken!', HttpStatus.BAD_REQUEST);
      case ErrorValue.CREATION_ERROR:
        throw new HttpException('Unable To Create Channel!', HttpStatus.BAD_REQUEST);
      default:
        return JSON.stringify({'msg':`Channel ${channelProp.name} Created Successfully!`})
    }
  }

  @Put('/:userId')
  async joinOrExitChannel ( @Body() requestProps: JoinOrExitChannelDTO ){
    const response: string = await this.channelsService.joinOrExitChannel(requestProps);
    return JSON.stringify({'message': response})
  }

}