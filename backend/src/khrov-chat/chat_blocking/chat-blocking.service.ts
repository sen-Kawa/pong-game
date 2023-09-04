import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Chat_union, User } from '@prisma/client'; 
import BlockingDTO from './dto/blocking.dto';

@Injectable()
export class ChatBlockingService {
  constructor(private prisma: PrismaService){}

  async getBlocked(userId: number): Promise<Chat_union[]> {
    return await this.prisma.chat_union.findMany({
      where: {
        client1Id: userId,
        blockStatus: true,
        allowedToUnblock: true,
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        client2: {
          select: {
            userName: true,
            profile_pics: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async blockUser(blockDetails: BlockingDTO ): Promise<boolean> {

    if (await this.verifyUserIDs(blockDetails) === false){
      return false;
    }

    let [blockerUnionId, blockedUnionId] = await this.verifyUnionIDs(blockDetails);

    if (!blockerUnionId || !blockedUnionId) {

      [blockerUnionId, blockedUnionId] = await this.createUnionIDs(blockDetails);

      if (!blockerUnionId || !blockedUnionId){
        return false;
      }
    }

    await this.prisma.chat_union.update({
      where: { 
        unionId: blockerUnionId, 
      },
      data: {
        blockStatus: true,
        allowedToUnblock: true,
      }
    });
    await this.prisma.chat_union.update({
      where: { 
        unionId: blockedUnionId, 
      },
      data: {
        blockStatus: true,
      }
    });
  }

  async unblockUser(blockDetails: BlockingDTO ): Promise<boolean> {

    if (await this.verifyUserIDs(blockDetails) === false){
      return false;
    }

    let [blockerUnionId, blockedUnionId] = await this.verifyUnionIDs(blockDetails);

    if (!blockerUnionId || !blockedUnionId) {
      return false;
    }

    try {
      await this.prisma.chat_union.update({
        where: { 
          unionId: blockerUnionId, 
          blockStatus: true,
          allowedToUnblock: true,
        },
        data: {
          blockStatus: false,
          allowedToUnblock: false,
        }
      });
      await this.prisma.chat_union.update({
        where: { 
          unionId: blockedUnionId, 
        },
        data: {
          blockStatus: false,
          allowedToUnblock: false,
        }
      });
    } catch (error) {
      return false;
    }
  }

  private async createUnionIDs(blockDetails: BlockingDTO): Promise<number[]> {
    try {
      let blockerUnionId: number = 0;
      let blockedUnionId: number = 0;
      await this.prisma.chat_union.create({
        data: { 
          client1Id: blockDetails.blockerId,
          client2Id: blockDetails.blockedId,
          unionIdOther: 0,  
        },
        select: {
          unionId: true,
        }
      })
      .then(data => {blockerUnionId = data.unionId});
      await this.prisma.chat_union.create({
        data: { 
          client2Id: blockDetails.blockerId,
          client1Id: blockDetails.blockedId,
          unionIdOther: blockerUnionId
        },
        select: {
          unionId: true,
        }
      })
      .then(data => {blockedUnionId = data.unionId});

      await this.prisma.chat_union.update({
        where: { 
          unionId: blockerUnionId, 
        },
        data: {
          unionIdOther: blockedUnionId,
        }
      });
      return [blockerUnionId, blockedUnionId];
    } catch (error) {
      return [0, 0];
    }
  }

  private async verifyUnionIDs(blockDetails: BlockingDTO): Promise<number[]> {
    let blockerUnionId: number = 0;
    let blockedUnionId: number = 0;
    try {

      await this.prisma.chat_union.findFirstOrThrow({
        where: {
            client1Id: blockDetails.blockerId,
            client2Id: blockDetails.blockedId,
          },
        select: {
            unionId: true,
            unionIdOther: true,
          },
        })
      .then(data => {
        blockerUnionId = data.unionId;
        blockedUnionId = data.unionIdOther;
      })
      return [blockerUnionId, blockedUnionId];
    } catch (error) {
      return [0, 0];
    }
  }

  private async verifyUserIDs(blockDetails: BlockingDTO): Promise<boolean> {
    try {

      await this.prisma.user.findUniqueOrThrow({
        where: {
          id: blockDetails.blockerId,
        },
      });
      await this.prisma.user.findUniqueOrThrow({
        where: {
          id: blockDetails.blockedId,
        },
      });
    } catch(error) {
      return false;
    }
  }
}
