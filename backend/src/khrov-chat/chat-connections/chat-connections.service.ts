import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Chat_union, Chat_history } from '@prisma/client';  

@Injectable()
export class ChatConnectionsService {

  constructor(private prisma: PrismaService) {}

  async chatConnections(userId: number ): Promise<object | boolean> { 

    const connections: object = await this.prisma.chat_union.findMany({
      where: {
        client1Id: {
          equals: userId,
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        client2: {
          select: {
            userName: true,
            email: true,
            name: true,
            updatedAt: true,
            profile_pics: {
              select: {
                avatar: true,
              },
            },
          },
        },
        chat_historys: {
          orderBy: {
            time: 'desc'
          },
          take: 1,
          select: {
            unionId: true,
            outgoing: true,
            incoming: true,
            time: true,
            deliveryStatus: true,
          },
        },
      },
    });

    for (let key in connections) {
      const myUnionId = connections[key].unionId;
      const otherUnionId = connections[key].unionIdOther;

      if (connections[key].chat_historys[0]) 
      {
        if (connections[key].chat_historys[0].deliveryStatus === 'sent'
          && connections[key].chat_historys[0].incoming ){
          await this.prisma.chat_history.updateMany({
            where: {
              unionId: {
                in: [myUnionId, otherUnionId]
              },
              deliveryStatus: 'sent'
            },
            data: {
              deliveryStatus: 'delivered'
            },
          });
        }
      } else 
      {
        delete connections[key];
      }      
    }    

    let cleaned = Object.fromEntries(Object.entries(connections).filter(([_, v]) => v != null));

    return cleaned;
  }
}
