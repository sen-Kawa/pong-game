import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Chat_union } from '@prisma/client'; 
import SearchUsersDTO from './dto/search-users.dto';

@Injectable()
export class SearchUsersService {
  constructor(private prisma: PrismaService) {}

  async searchUsers(details: SearchUsersDTO) {
    const output = await this.prisma.user.findMany({
      where: {
        OR: [ 
          { 
            userName: {
              startsWith: details.key,
              mode: 'insensitive',
            },
          },
          {
            name: {
              startsWith: details.key,
              mode: 'insensitive',
            }
          },
          {
            displayName: {
              startsWith: details.key,
              mode: 'insensitive',
            }
          },
        ],
        NOT: {
          id: details.searcherId
        },
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        userName: true,
        createdAt: true,
        profile_pics: {
          select: {
            avatar: true
          }
        },
      }, 
    });

    let i: number = 0;
    for (let key in output) {
      const other = output[key];
      const otherId = other.id;
      try {
        await this.prisma.chat_union.findFirstOrThrow({
          where: {
            client1Id: details.searcherId,
            client2Id: otherId,
            blockStatus: true,
          },
          include: {},
        });
        output.splice(i, 1);
      } catch (error){}
      i++;
    }

    return output;
  }
}
