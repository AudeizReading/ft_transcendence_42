import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Friend, User, Game, Prisma } from '@prisma/client';

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

  async acceptFriendRequest(fromId: number, toId: number)
  {
    await this.prisma.friend.updateMany({
      where: {
        userAId: +fromId,
        userBId: +toId,
      },
      data: {
        state: "FRIEND"
      },
    })
    console.log(`Users ${fromId} and ${toId} are now friends.`);
  }

  async deleteFriendship(fromId: number, toId: number)
  {
    await this.prisma.friend.deleteMany({
      where: {
        userAId: +fromId,
        userBId: +toId,
      }
    });
    console.log(`Users ${fromId} and ${toId} are no longer friends.`);
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
        state: 'asc' // WAITING first
      },
      include: {
        userA: {
          include: {
            games: true
          }
        },
        userB: {
          include: {
            games: true
          }
        },
      },
    });
    data.forEach((item: Friend & {
      userA: User & { games: Game[] },
      userB: User & { games: Game[] }
    }) => {
      // const user = (item.userA.id !== userId) ? item.userA : item.userB;
      const user = item.userA;
      friends.push({
        id: user.id,
        name: user.name,
        avatar: user.avatar.replace(
              '://<<host>>',
              '://' + process.env.FRONT_HOST,
            ),
        status: 'offline', // TODO: "offline" | "online" | "playing"
        friend_status: (item.state === 'WAITING') ? 'pending' : 'accepted',
        games_played: user.games.length,
        games_won: user.games.filter((game: Game) => game.winnerId === user.id).length,
      });
    });
    return friends.filter((item: FriendForFront) => item.id !== userId);
  }
}
