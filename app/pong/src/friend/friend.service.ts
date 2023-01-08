import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Friend, User, Game, Prisma, PlayerGame } from '@prisma/client';
import { NotifService } from 'src/notif/notif.service';
import { UsersService } from 'src/users/users.service';

export interface FriendForFront {
  id: number,
  name: string,
  avatar: string,
  status: 'offline' | 'online' | 'playing',
  friend_status: 'requested' | 'pending' | 'accepted',
  games_played: number,
  games_won: number,
}

@Injectable()
export class FriendService {
  constructor(
    private prisma: PrismaService,
    private notif: NotifService,
    private usersService: UsersService,
  ) {}

  async createFriend(userA_name: string, userAId: number, userBId: number): Promise<Friend>
  {
    if (+userAId === +userBId)
      throw new BadRequestException("Cannot be friend to self");
      
    const otherFriendships = await this.prisma.friend.findMany({
      where: {
        userAId: +userBId,
        userBId: +userAId,
      }
    });
    if (otherFriendships.length) {
      await this.acceptFriendRequest(userBId, userAId);
      return otherFriendships[0];
    }

    const newFrienship = await this.prisma.friend.create({
      data: {
        userAId,
        userBId
      },
    });
    this.notif.createNotif(userBId, {
      text: `${userA_name} vous a envoyé une demande d'ami`,
      url: `user/${userAId}`,
    });
    return newFrienship;
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
    });
    console.log(`Users ${fromId} and ${toId} are now friends.`);
  }

  async deleteFriendship(fromId: number, toId: number)
  {
    await this.prisma.friend.deleteMany({
      where: {
        OR: [
          { userAId: +fromId, userBId: +toId },
          { userAId: +toId, userBId: +fromId },
        ]
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

  async objectForFront(userId: number): Promise<FriendForFront[]>
  {
    // Yes, this is horrifying. But it's gotta be there. Read this with the schema next to it.
    // So, this type represents a Friend, containing both userA and B.
    // Each of them include the "games" PlayerGame array, and each item of the array also contains
    // the Game "game" type. You don't get it ? Too bad.
    type dataType = Friend & {
      userA: User & { games: PlayerGame & {game: Game}[] },
      userB: User & { games: PlayerGame & {game: Game}[] }
    };

    const data: dataType[] = await this.friends({
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
            games: {
              include: {
                game: true,
              }
            }
          }
        },
        userB: {
          include: {
            games: {
              include: {
                game: true,
              }
            }
          }
        },
      },
    }) as dataType[];

    const getFriendStatus = (fromId: number, state: string) => {
      if (fromId === userId && state === 'WAITING')
        return "requested";
      return (state === 'WAITING' ? "pending" : "accepted");
    }

    const getUserStatus = (user: any, games: PlayerGame & {game: Game}[]) => {
      if (!user.sessionid || Date.now() - user.lastFetch.getTime() > 10_000) {
        return "offline";
      }
      const isPlaying = games.findIndex(x => x.game.state !== "ENDED") !== -1;
      return isPlaying ? "playing" : "online";
    }

    const friends = data.map((item) => {
        const user = (item.userA.id !== userId) ? item.userA : item.userB;
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar.replace(
                '://<<host>>',
                '://' + process.env.FRONT_HOST,
              ),
          status: getUserStatus(user, user.games),
          friend_status: getFriendStatus(item.userAId, item.state),
          games_played: user.games.length,
          games_won: user.games.filter((playerGame) => playerGame.game.winnerId === user.id).length,
        } as FriendForFront;
      })
      .sort((a, b) => { // Sorts in the order described in the array
        const statusOrder = ["pending", "accepted", "requested"];
        const statusA = statusOrder.findIndex((status) => status === a.friend_status);
        const statusB = statusOrder.findIndex((status) => status === b.friend_status);
        return statusA - statusB;
    });

    return friends;
  }
}
