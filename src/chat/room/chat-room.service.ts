import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatRoomService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(dto: CreateRoomDto) {
    const userUuids: string[] = [];

    for (const uuid of dto.memberUuids) {
      const user = await this.prisma.user.findUnique({
        where: { uuid },
      });
      if (!user) throw new NotFoundException(`User not found: ${uuid}`);
      userUuids.push(user.uuid);
    }

    const room = await this.prisma.chatRoom.create({
      data: {
        name: dto.name,
        members: {
          create: userUuids.map((uuid) => ({ userId: uuid })),
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    return room;
  }

  async getRoomsByUserUuid(uuid: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw new NotFoundException('User not found');

    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId: user.uuid,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rooms;
  }
}
