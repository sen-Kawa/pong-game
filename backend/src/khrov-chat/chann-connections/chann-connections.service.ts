import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Channel_link, Channel_history } from '@prisma/client';
import ChannHistoryDTO from './dto/chann-history.dto'; 
import UpdateChannDTO from './dto/update-chann.dto';
import SetSeenDTO from './dto/set-seen.dto';

@Injectable()
export class ChannConnectionsService {

  constructor(private prisma: PrismaService) {}

  async channConnections(userId: number ): Promise<Channel_link[]> {

    const connections: Channel_link[] = await this.prisma.channel_link.findMany({
      where: {
        userId: {
          equals: userId,
        },
      NOT: {
          linkStatus: 'banned', 
        },
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        ch: {
          select: {
            name: true,
            desc: true,
            visibility: true,
          },
        },
      },
    });

    return connections;
  }

  async channHistory(channel: ChannHistoryDTO): Promise<Channel_history[] | boolean> {

    try {

      await this.prisma.channel_link.findFirstOrThrow({
        where: {
          chId: channel.chId,
          userId: channel.userId,
          NOT: {
            linkStatus: 'banned', 
          },
        }
      });
    } catch (error) {
      return false;
    }

    const history: Channel_history[] = await this.prisma.channel_history.findMany({
      where: {
        chId: channel.chId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            userName: true
          }
        }
      },
    });

    try {

      const muteExpire = await this.prisma.channel_link.findFirstOrThrow({
        where: {
          chId: channel.chId,
          userId: channel.userId,
          linkStatus: 'muted',
        },
        select: {
          updatedAt: true,
          mutedUntil: true
        }
      });

      if (new Date() >= muteExpire.mutedUntil) {

        await this.prisma.channel_link.updateMany({
          where: { 
            chId: channel.chId,
            userId: channel.userId,
            linkStatus: 'muted',
          },
          data: {
            linkStatus: 'good'
          }
        });
      }
    } catch (error) {}

    return history;
  }

  async updateChanns(channPayload : UpdateChannDTO[]) {

    for( let singleChannKey in channPayload ) {
      let singleChannObject: UpdateChannDTO = channPayload[singleChannKey];

      try {
        await this.prisma.channel_link.findFirstOrThrow({
          where: {
            chId: singleChannObject.chId,
            userId: singleChannObject.userId,
            OR: [ 
              { 
                linkStatus: 'good'
              },
              {
                role: 'owner'
              },
            ], 
          }
        });
      } catch (error) {

        continue ;
      }

      await this.prisma.channel_history.create({
        data: { 
          chId: singleChannObject.chId,
          userId: singleChannObject.userId,
          outgoing: singleChannObject.msg,
          createdAt: singleChannObject.time
        }
      })

      await this.prisma.channel_link.updateMany({
        where: {
          chId: singleChannObject.chId, 
          NOT: {
            OR: [ 
              { 
                userId: singleChannObject.userId, 
              },
              { 
                linkStatus: 'banned', 
              },
            ],
          },
        },
        data: {
          unreadCount: {
            increment: 1,
          },
        },
      });

      await this.prisma.channel_link.updateMany({
        where: { 
          chId: singleChannObject.chId,
          userId: singleChannObject.userId,
        },
        data: {
          userId: singleChannObject.userId,
        }
      });
    }
  }

  async setSeen(channDetails: SetSeenDTO) {

    await this.prisma.channel_link.updateMany({
      where: { 
        chId: channDetails.chId,
        userId: channDetails.userId,
      },
      data: {
        unreadCount: 0,
      }
    });
  }
}
