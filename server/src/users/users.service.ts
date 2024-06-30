import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  DeleteUserParams,
  FindAllUsersParams,
  FindOneUserParams,
  IUsersService,
  UpdateUserParams,
} from './interfaces/IUsersService';

@Injectable()
export class UsersService implements IUsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userCreateInput: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({ data: userCreateInput });
  }

  async find(userWhereInput: Prisma.UserWhereInput) {
    try {
      return this.prismaService.user.findFirst({ where: userWhereInput });
    } catch (err) {
      throw new NotFoundException({ message: 'User not found' });
    }
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
  }

  async findOne(params: FindOneUserParams): Promise<User | null> {
    try {
      return this.prismaService.user.findUnique({
        where: params.where,
      });
    } catch (err) {
      throw new NotFoundException({ message: 'User not found' });
    }
  }

  async findAll(params: FindAllUsersParams) {
    const { page = 1, perPage = 50, where, orderBy } = params;
    const paginate = createPaginator({ perPage });
    return paginate<User, Prisma.UserFindManyArgs>(
      this.prismaService.user,
      {
        ...(where && { where }),
        ...(orderBy && { orderBy }),
      },
      {
        page,
      },
    );
  }

  async update(params: UpdateUserParams): Promise<User | null> {
    const { where, data } = params;
    try {
      return this.prismaService.user.update({
        where,
        data,
      });
    } catch (err) {
      throw new NotFoundException({ message: 'User not found' });
    }
  }

  async delete(params: DeleteUserParams): Promise<User | null> {
    try {
      return this.prismaService.user.delete({
        where: params.where,
      });
    } catch (err) {
      throw new NotFoundException({ message: 'User not found' });
    }
  }
}
