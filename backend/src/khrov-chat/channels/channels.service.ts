import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import AddChannelDTO from './dto/add-channel.dto';
import SearchChannelsDTO from './dto/search-channels.dto';
import JoinOrExitChannelDTO from './dto/join-or-exit-channel.dto';
import { User, Channel, Channel_link, Channel_history } from '@prisma/client';  
import * as bcrypt from 'bcrypt';
import { ErrorValue } from './enums/error-value.enum';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService){}

  async addChannel(channelProp: AddChannelDTO): Promise<ErrorValue> {

    try {
      await this.prisma.user.findUniqueOrThrow({
        where: {
          id: channelProp.userId,
        },
      });
    } catch (error) {
      return ErrorValue.NO_USER;
    }

    try {
      await this.prisma.channel.findUniqueOrThrow({
        where: {
          name: channelProp.name,
        },
      });
      return ErrorValue.CHANNEL_EXISTS;
    } catch (error) {}

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(channelProp.password, saltOrRounds);

    let channelId: number;
    const result = await this.prisma.channel.create({
      data: { 
        name: channelProp.name,
        desc: channelProp.desc,
        visibility: channelProp.visibility,
        password: hash
      },
      select: {
        id: true,
      }
    })
    .then(data => {channelId = data.id; return ErrorValue.SUCCESS;})
    .catch(error => { return ErrorValue.CREATION_ERROR; })

    if (result === ErrorValue.CREATION_ERROR) {
      return ErrorValue.CREATION_ERROR;
    }

    const linkResult = await this.prisma.channel_link.create({
      data: { 
        chId: channelId,
        userId: channelProp.userId,
        role: 'owner',
        linkStatus: 'good'
      },
      select: {
        chId: true,
      }
    })
    .then(data => {return data.chId;});

    if (linkResult) {
      return ErrorValue.SUCCESS;
    }
  }

  async suggestedChannels(userId: number): Promise<object | ErrorValue> {

    try {
      await this.prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      return ErrorValue.NO_USER;
    }

    const output: any[] = await this.prisma.channel_link.findMany({
      where: {},
      orderBy: {
        updatedAt: 'desc'
      },
      take: 500,
      include: {
        ch: {
          select: {
            id: true,
            name: true,
            desc: true,
            visibility: true
          }
        }
      },
    });

    const ourCache = {};
    for (let key in output) {

      const outputElem = output[key];

      const banned = await this.prisma.channel_link.findFirst({
        where: {
          userId: userId,
          chId: outputElem.chId,
          linkStatus: 'banned',
        },
        include: {}
      });
      if (banned) {
        continue ;
      }

      const chKey: number = outputElem.chId;
      const tmp = {
        id: outputElem.chId,
        name: outputElem.ch.name,
        desc: outputElem.ch.desc,
        visibility: outputElem.ch.visibility,
        role: '',
      }

      ourCache[chKey] = tmp;

      if (Object.keys(ourCache).length == 20) {
        break ;
      }
    }

    for (let key in ourCache) {
      const uniqueChannel = ourCache[key];
      try {
       const output = await this.prisma.channel_link.findFirstOrThrow({
          where: {
            chId: uniqueChannel.id,
            userId: userId,
          },
          select: {
            role: true
          }
        });

        ourCache[key].role = output.role;
      } catch (error) {

        ourCache[key].role = 'not';
      }
    }

    return ourCache;
  }

  async searchChannels(details: SearchChannelsDTO) {

    const output = await this.prisma.channel.findMany({
      where: {
        OR: [ 
          { 
            name: {
              startsWith: details.key,
              mode: 'insensitive',
            },
          },
          {
            desc: {
              contains: details.key,
              mode: 'insensitive',
            }
          },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        desc: true,
        visibility: true,
      }, 
    });

    const ourCache = {};
    for (let key in output) {
      const uniqueChannel = output[key];
      try {
       const result = await this.prisma.channel_link.findFirstOrThrow({
          where: {
            chId: uniqueChannel.id,
            userId: details.userId,
          },
          select: {
            role: true,
            linkStatus: true
          }
        });

        if (result.linkStatus != 'banned') {
          ourCache[uniqueChannel.id] = uniqueChannel;
          ourCache[uniqueChannel.id].role = result.role;
        }
      } catch (error) {

        ourCache[uniqueChannel.id] = uniqueChannel;
        ourCache[uniqueChannel.id].role = 'not';
      }
    }
    return ourCache;
  }

  async joinOrExitChannel(requestProps: JoinOrExitChannelDTO): Promise<string> {

    const theChannel = await this.prisma.channel.findUnique({
      where: {
        id: requestProps.chId
      },
      include: {}
    })
    if (!theChannel) {
      return `Unknown Channel!`;
    }

    if (requestProps.joinOrExit===false) {
      const deleteLink = await this.prisma.channel_link.deleteMany({
        where: { 
          userId: requestProps.userId,
          chId: requestProps.chId,
        },
      })

      if (deleteLink.count > 0) {
        const createExitMsg = await this.prisma.channel_history.create({
          data: { 
            chId: requestProps.chId,
            userId: requestProps.userId,
            outgoing: '',
            deliveryStatus: 'exited',
          },
        })

        return `You have left channel ${theChannel.name} Successfully`;
      }

      else {
        return `Nothing to process!`;
      }
    }

    else if (requestProps.joinOrExit===true) {

      try {
        const checkBanned = await this.prisma.channel_link.findFirstOrThrow({
          where: {
            chId: requestProps.chId,
            userId: requestProps.userId,
          },
        });

        if (checkBanned.linkStatus=='banned') {
          return `You are banned from ${theChannel.name} channel`;
        } else {
          return `You are already a member of ${theChannel.name} channel`;
        }
      } catch (error) {}

      if (theChannel.visibility=='public') {
        const addToPublic = await this.prisma.channel_link.create({
          data: { 
            chId: requestProps.chId,
            userId: requestProps.userId,
            role: 'user',
            linkStatus: 'good',
            channel_historys: {
              create: [{
                chId: requestProps.chId,
                userId: requestProps.userId,
                outgoing: 'joined',
                deliveryStatus: 'joined',
              }]
            }
          },
        });
        return `You are now a member of ${theChannel.name} channel`;
      } 

      else if (theChannel.visibility=='password') {
        const isMatch = await bcrypt.compare(requestProps.password, theChannel.password);
        if (!isMatch) {
          return `Please contact ${theChannel.name} channel Admins for right access password`;
        }
        const addToPassword = await this.prisma.channel_link.create({
          data: { 
            chId: requestProps.chId,
            userId: requestProps.userId,
            role: 'user',
            linkStatus: 'good',
            channel_historys: {
              create: [{
                chId: requestProps.chId,
                userId: requestProps.userId,
                outgoing: 'joined',
                deliveryStatus: 'joined',
              }]
            }
          },
        });
        return `You are now a member of ${theChannel.name} channel`;
      }

      else if (theChannel.visibility=='private') {
        const addToPrivate = await this.prisma.channel_pending.create({
          data: { 
            chId: requestProps.chId,
            userId: requestProps.userId,
          },
        });
        return `Your request to join ${theChannel.name} channel is now awaiting moderation`;
      }
    }

    else {
      return 'Your request was not understood!'
    }

  }
}
