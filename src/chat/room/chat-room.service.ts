import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
@Injectable()
export class ChatRoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createRoom(dto: CreateRoomDto) {
    console.log('📥 [createRoom] 호출됨 - dto:', dto);

    const userUuids: string[] = [];

    for (const uuid of dto.memberUuids) {
      console.log('🔍 [createRoom] 사용자 조회 시도 - uuid:', uuid);

      const user = await this.prisma.user.findUnique({
        where: { uuid },
      });

      if (!user) {
        console.error(`❌ [createRoom] 사용자 없음 - uuid: ${uuid}`);
        throw new NotFoundException(`User not found: ${uuid}`);
      }

      userUuids.push(user.uuid);
      console.log(`✅ [createRoom] 사용자 확인됨 - uuid: ${user.uuid}`);
    }

    console.log('🧱 [createRoom] 채팅방 생성 시작 - 사용자:', userUuids);

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

    console.log('🎉 [createRoom] 채팅방 생성 완료 - roomId:', room.id);

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
          select: {
            text: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rooms.map((room) => ({
      ...room,
      lastMessage: room.messages[0]?.text ?? '',
      lastMessageTime: room.messages[0]?.createdAt ?? null,
    }));
  }

  async deleteRoom(roomId: string, userUuid: string) {
    const isMember = await this.prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        userId: userUuid,
      },
    });

    if (!isMember) {
      throw new ForbiddenException('이 채팅방에 대한 삭제 권한이 없습니다.');
    }

    await this.prisma.chatMessage.deleteMany({
      where: { roomId },
    });

    await this.prisma.chatRoomMember.deleteMany({
      where: { roomId },
    });

    await this.prisma.chatRoom.delete({
      where: { id: roomId },
    });

    return { success: true };
  }
}
