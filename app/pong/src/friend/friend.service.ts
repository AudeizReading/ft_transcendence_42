import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Friend, User, Prisma } from '@prisma/client';

export interface FriendForFront {
  id: number,
  name: string,
  avatar: string,
  status: 'offline' | 'online' | 'playing',
  friend_status: 'pending' | 'accepted',
  games_played: number,
  games_won: number,
}

@Injectable()
export class FriendService {
  constructor(private prisma: PrismaService) {}

  async createFriend(userAId: number, userBId: number): Promise<Friend> {
    return this.prisma.friend.create({
      data: {
        userAId,
        userBId
      },
    });
  }

  async friend(
    friendWhereUniqueInput: Prisma.FriendWhereUniqueInput,
  ): Promise<Friend | null> {
    return this.prisma.friend.findUnique({
      where: friendWhereUniqueInput,
    });
  }

  async friends(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.FriendWhereUniqueInput;
    where?: Prisma.FriendWhereInput;
    orderBy?: Prisma.FriendOrderByWithRelationInput;
    //select?: Prisma.FriendSelect;
    include?: Prisma.FriendInclude;
  }): Promise<Friend[]> {
    // if uncomment the code, switch with any because select
    const { skip, take, cursor, where, orderBy, /*select,*/ include } = params;
    //const opt: any = {};
    //if (include) opt.include = include;
    //else opt.select = select;
    return this.prisma.friend.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
      //...opt,
    });
  }

  async objectForFront(userId: number): Promise<FriendForFront[]> {
    const friends: FriendForFront[] = [];
    const data = await this.friends({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
      orderBy: {
        state: 'desc' // WAITING FIRST ???
      },
      include: {
        userA: true,
        userB: true,
      },
    });
    data.forEach((item: Friend & { userA: User, userB: User }) => {
      const user = (item.userA.id !== userId) ? item.userA : item.userB
      friends.push({
        id: user.id,
        name: user.name,
        avatar: user.avatar.replace(
              '://<<host>>',
              '://' + process.env.FRONT_HOST,
            ),
        status: 'offline', //| 'online' | 'playing',
        friend_status: (item.state === 'WAITING') ? 'pending' : 'accepted',
        games_played: 0,
        games_won: 0,
      });
    });
    return friends
  }
}
