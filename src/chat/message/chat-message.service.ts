import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatMessageService {
  constructor(private prisma: PrismaService) {}

  private userSocketMap = new Map<string, string>(); // userId -> socketId
  private socketUserMap = new Map<string, string>(); // socketId -> userId

  bindUserSocket(userId: string, socketId: string) {
    this.userSocketMap.set(userId, socketId);
    this.socketUserMap.set(socketId, userId);
  }

  unbindSocket(socketId: string) {
    const userId = this.socketUserMap.get(socketId);
    if (userId) {
      this.userSocketMap.delete(userId);
    }
    this.socketUserMap.delete(socketId);
  }

  getSocketIdByUser(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  async saveMessage(dto: SendMessageDto) {
    const { senderId, roomId, text } = dto;

    if (!roomId) {
      throw new Error('roomId가 누락되었습니다.');
    }

    if (!senderId) {
      throw new Error('senderId가 누락되었습니다.');
    }

    return this.prisma.chatMessage.create({
      data: {
        senderId,
        roomId,
        text,
      },
    });
  }

  async getRoomMemberSocketIds(roomId: string): Promise<string[]> {
    const members = await this.prisma.chatRoomMember.findMany({
      where: { roomId },
      select: { userId: true },
    });

    return members
      .map((member) => this.getSocketIdByUser(member.userId))
      .filter((id): id is string => Boolean(id)); // undefined 제거
  }
}
