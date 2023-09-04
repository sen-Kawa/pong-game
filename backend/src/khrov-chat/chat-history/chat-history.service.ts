import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Chat_union, Chat_history, User } from '@prisma/client'; 
import UpdateChatDTO from './dto/update-chat.dto';
import NewChatDTO from './dto/new-chat.dto';
import SetSeenDTO from './dto/set-seen.dto';

@Injectable()
export class ChatHistoryService {
  constructor(private prisma: PrismaService) {}

  async getChatHistory(chatUnion: number): Promise<Chat_union | boolean> {
    try {
     const resolve: Chat_union = await this.prisma.chat_union.findUniqueOrThrow({
        where: {
          unionId: chatUnion,
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
            }
          },
          chat_historys: {
            orderBy: {
              time: 'desc'
            },
            select: {
              outgoing: true,
              incoming: true,
              time: true,
              deliveryStatus: true,
            },
          },
        },  
      });
      return resolve;
    } catch (error) {
      return false;
    }
  }

  async updateChats(chatPayload : UpdateChatDTO[]): Promise<boolean> {
    for( let singleChatKey in chatPayload ) {
      let singleChatObject: UpdateChatDTO = chatPayload[singleChatKey];
      if ( singleChatObject.deliveryStatus === 'pending' ) {
        if ( await this.insertMsgToDb(singleChatObject) === false ) {
          return false;
        }
        else {
          return true;
        }
      }
    }
  }
  private insertMsgToDb = async (singleChatObject: UpdateChatDTO): Promise<boolean> => {

    try {

      const status1: {blockStatus: boolean} = await this.prisma.chat_union.findUniqueOrThrow({
        where: {
          unionId: singleChatObject.unionId,
        },
        select: {
          blockStatus: true,
        }
      });
      if ( status1.blockStatus === true ) {
        throw new Error('Blocked from messaging');
      }

      const status2: {blockStatus: boolean} = await this.prisma.chat_union.findUniqueOrThrow({
        where: {
          unionId: singleChatObject.unionIdOther,
        },
        select: {
          blockStatus: true,
        }
      });
      if ( status2.blockStatus === true ) {
        throw new Error('Blocked from messaging');
      }
    } catch(error) {
      return false;
    }

    const insert: { count: number } = await this.prisma.chat_history.createMany({
      data: [
        { 
          unionId: singleChatObject.unionId,
          outgoing: singleChatObject.outgoing,
          time: singleChatObject.time,
          deliveryStatus: 'sent'
        },
        {
          unionId: singleChatObject.unionIdOther,
          incoming: singleChatObject.outgoing,
          time: singleChatObject.time,
          deliveryStatus: 'sent'
        }
      ]
    })

    await this.prisma.chat_union.update({
      where: { 
        unionId: singleChatObject.unionIdOther, 
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      }
    });

    await this.prisma.chat_union.update({
      where: { 
        unionId: singleChatObject.unionId 
      },
      data: {
        unionId: singleChatObject.unionId
      }
    });
  }

  async newChat(newChat: NewChatDTO): Promise<boolean> {
    try {

      await this.prisma.user.findUniqueOrThrow({
        where: {
          id: newChat.senderId,
        },
      });
      await this.prisma.user.findUniqueOrThrow({
        where: {
          id: newChat.receiverId,
        },
      });
    } catch(error) {
      return false;
    }

    let alreadyExisting: number = 0;
    let senderIdUnionId: number = 0;
    let receiverIdUnionId: number = 0;
    await this.prisma.chat_union.findMany({
      where: {
          client1Id: newChat.senderId,
          client2Id: newChat.receiverId,
        },
      select: {
          unionId: true,
          unionIdOther: true,
        },
      })
      .then(data => {
        if (data.length) {
          alreadyExisting+=1;
          senderIdUnionId = data[0].unionId;
          receiverIdUnionId = data[0].unionIdOther;
        }
      })

    await this.prisma.chat_union.findMany({
      where: {
          client1Id: newChat.receiverId,
          client2Id: newChat.senderId,
        },
      include: {
        },
      })
      .then(data => {
        if (data.length) {
          alreadyExisting+=1;
        }
      });

    if ( alreadyExisting == 1 ){
      return false;
    }

    if ( alreadyExisting == 0 ) {
      await this.prisma.chat_union.create({
        data: { 
          client1Id: newChat.senderId,
          client2Id: newChat.receiverId,
          unionIdOther: 0
        },
        select: {
          unionId: true,
        }
      })
      .then(data => {senderIdUnionId = data.unionId});

      await this.prisma.chat_union.create({
        data: { 
          client2Id: newChat.senderId,
          client1Id: newChat.receiverId,
          unionIdOther: senderIdUnionId
        },
        select: {
          unionId: true,
        }
      })
      .then(data => {receiverIdUnionId = data.unionId});

      await this.prisma.chat_union.update({
        where: { 
          unionId: senderIdUnionId, 
        },
        data: {
          unionIdOther: receiverIdUnionId,
        }
      });
    }

    const chatToObject: UpdateChatDTO = {
      outgoing: newChat.msg,
      time: new Date().toISOString(),
      deliveryStatus: 'sent',
      unionId: senderIdUnionId,
      unionIdOther: receiverIdUnionId,
    }
    if ( await this.insertMsgToDb(chatToObject) === false ){
      return false;
    }
  }

  async setSeen(chatDetails: SetSeenDTO): Promise<boolean> {
    try{

      await this.prisma.chat_history.updateMany({
        where: {
          unionId: chatDetails.theySender,
          incoming: null,
          deliveryStatus: {
            in: ['sent', 'delivered']
          },
        },
        data: {
          deliveryStatus: 'seen'
        },
      });

      const unreadCnt: {unreadCount: number} = await this.prisma.chat_union.findUniqueOrThrow({
            where: {
              unionId: chatDetails.meReceiver,
            },
            select: {
              unreadCount: true,
            }
          });
      if ( unreadCnt.unreadCount > 0 ) {
        await this.prisma.chat_union.update({
          where: { 
            unionId: chatDetails.meReceiver, 
          },
          data: {
            unreadCount: 0
          }
        });
      }

    } catch (error) {
      return false;
    }
  }

  async deleteChatHistory(union: number): Promise<boolean> {
    try {
      await this.prisma.chat_history.deleteMany({
        where: { 
          unionId: union,
        },
      })
    } catch (error) {
      return false;
    }
  }

}
