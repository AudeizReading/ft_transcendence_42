import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any; // TODO: Prisma

@Injectable()
export class UsersService {
  private readonly users = [ // TODO: Prisma
    {
      id: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      id: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username); // TODO: Prisma
  }
}
