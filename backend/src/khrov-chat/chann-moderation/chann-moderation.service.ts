import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import ModerateUsersDTO from './dto/moderate-users.dto';
import GetMemberIdDTO from './dto/get-member-id.dto';
import PendingApprovalsDTO from './dto/pending-approvals.dto';
import { Channel_pending } from '@prisma/client';
import ApproveOrRejectDTO from './dto/approve-or-reject.dto';
import ModifyChannelDTO from './dto/modify-channel.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannModerationService {
  constructor(private prisma: PrismaService){}

  async moderateUsers(moderateProp: ModerateUsersDTO): Promise<string> {

    if (moderateProp.adminId===moderateProp.userId) {
      return 'You cannot moderate yourself!';
    }

    const moderator = await this.prisma.channel_link.findFirst({
      where: {
        userId: moderateProp.adminId,
        chId: moderateProp.chId,
        linkStatus: 'good',
        OR: [ 
          { 
            role: 'owner',
          },
          {
            role: 'admin',
          },
        ],
      },
      select: {
        role: true
      }
    })
    if (!moderator) {
      return `Unauthorized Action!`;
    }

    const member = await this.prisma.channel_link.findFirst({
      where: {
        userId: moderateProp.userId,
        chId: moderateProp.chId,
      },
      include: {
        user: {
          select: {
            userName: true,
          }
        }
      }
    })
    if (!member) {
      return `Member ID not found on this Channel!`;
    } else if (member.role=='owner') {
      return `Channel owners cannot be moderated!`;
    }

    if (moderator.role==='owner' && moderateProp.action==='setAsAdmin') {
      const updatedCount = await this.prisma.channel_link.updateMany({
        where: { 
          userId: moderateProp.userId,
          chId: moderateProp.chId,
          NOT: {
            linkStatus: 'banned',
          }
        },
        data: {
          role: 'admin',
        }
      });
      if (updatedCount.count > 0) {
        return `Success! ${member.user.userName} is now an Admin on this channel`;
      } else {
        return 'Unknown Error';
      }
    }
    else if (moderator.role!=='owner' && moderateProp.action==='setAsAdmin') {
      return `Only Channel Owner can Assign Admin Role`;
    }
    else if (moderateProp.action==='ban') {
      const updatedCount = await this.prisma.channel_link.updateMany({
        where: { 
          userId: moderateProp.userId,
          chId: moderateProp.chId,
        },
        data: {
          linkStatus: 'banned',
        }
      });
      if (updatedCount.count > 0) {
        return `Success! ${member.user.userName} is now banned from this channel`;
      } else {
        return 'Unknown Error';
      }
    }
    else if (moderateProp.action==='kick') { 
      const updatedCount = await this.prisma.channel_link.deleteMany({
        where: { 
          userId: moderateProp.userId,
          chId: moderateProp.chId,
        },
      });
      if (updatedCount.count > 0) {
        return `Success! ${member.user.userName} has been kicked out of this channel`;
      } else {
        return 'Unknown Error';
      }
    }
    else if (moderateProp.action==='mute') {
      const updatedCount = await this.prisma.channel_link.updateMany({
        where: { 
          userId: moderateProp.userId,
          chId: moderateProp.chId,
          NOT: {
            linkStatus: 'banned',
          }
        },
        data: {
          linkStatus: 'muted',
          mutedUntil: moderateProp.mutedUntil
        }
      });
      if (updatedCount.count > 0) {
        return `Success! ${member.user.userName} is now muted until ${moderateProp.mutedUntil}`;
      } 

      return 'Unknown Error';
    }

  }

  async getMemberId(getMemberId: GetMemberIdDTO): Promise<string> {

    const moderator = await this.prisma.channel_link.findFirst({
      where: {
        userId: getMemberId.adminId,
        chId: getMemberId.chId,
        linkStatus: 'good',
        OR: [ 
          { 
            role: 'owner',
          },
          {
            role: 'admin',
          },
        ],
      },
      include: {}
    })
    if (!moderator) {
      return `Unauthorized Action!`;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        userName: getMemberId.userName,
      },
      select: {
        id: true,
      }
    });
    if (!user) {
      return 'Unknown username';
    }
    return `UserId for ${getMemberId.userName} is ${user.id}`;
  }

  async pendingApprovals(pendingProp: PendingApprovalsDTO): Promise<Channel_pending[] | null> {

    const moderator = await this.prisma.channel_link.findFirst({
      where: {
        userId: pendingProp.adminId,
        chId: pendingProp.chId,
        linkStatus: 'good',
        OR: [ 
          { 
            role: 'owner',
          },
          {
            role: 'admin',
          },
        ],
      },
      include: {}
    })
    if (!moderator) {
      return null;
    }

    const output: Channel_pending[] = await this.prisma.channel_pending.findMany({
      where: {
        chId: pendingProp.chId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            userName: true,
          }
        }
      }
    });
    return output;
  }

  async approveOrReject(moderateProp: ApproveOrRejectDTO): Promise<string> {
    const deleted = await this.prisma.channel_pending.deleteMany({
      where: {
        chId: moderateProp.chId,
        userId: moderateProp.memberId,
      }
    });
    if (deleted.count < 1) {
      return 'Unknown Error!';
    }

    if (moderateProp.action===false) {
      return 'Success!';
    }

    if (moderateProp.action===true) {
      const linkResult = await this.prisma.channel_link.create({
        data: { 
          chId: moderateProp.chId,
          userId: moderateProp.memberId,
          role: 'user',
          linkStatus: 'good',
          channel_historys: {
            create: [{
              chId: moderateProp.chId,
              userId: moderateProp.memberId,
              outgoing: 'joined',
              deliveryStatus: 'joined',
            }]
          }
        }
      })

      if (linkResult) {
        return 'Success!';
      }
    }
  }

  async modifyChannel(newChannelProp: ModifyChannelDTO): Promise<string> {

    const moderator = await this.prisma.channel_link.findFirst({
      where: {
        userId: newChannelProp.adminId,
        chId: newChannelProp.chId,
        linkStatus: 'good',
        role: 'owner',
      },
      include: {}
    })
    if (!moderator) {
      return 'Unauthorized Access!';
    }

    const updated = await this.prisma.channel.update({
      where: { 
        id: newChannelProp.chId,
      },
      data: {
        visibility: newChannelProp.newVisibility,
      }
    });

    if (newChannelProp.newVisibility==='password') {

      const saltOrRounds = 10;
      const hash = await bcrypt.hash(newChannelProp.password, saltOrRounds);

      const passworded = await this.prisma.channel.update({
        where: { 
          id: newChannelProp.chId,
        },
        data: {
          password: hash,
        }
      });
    }
    return 'Success!';
  }
}
