import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async sendFriendRequest(senderUuid: string, receiverUuid: string) {
    const senderId = await this.userService.getUserIdByUuid(senderUuid);
    const receiverId = await this.userService.getUserIdByUuid(receiverUuid);

    if (senderId === receiverId) {
      throw new BadRequestException(
        '자기 자신에게 친구 요청을 보낼 수 없습니다.',
      );
    }

    const existingRequest = await this.prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: FriendRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('이미 친구 요청을 보냈습니다.');
    }

    return this.prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });
  }

  async acceptFriendRequest(requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== FriendRequestStatus.PENDING) {
      throw new NotFoundException('유효하지 않은 친구 요청입니다.');
    }

    await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.ACCEPTED },
    });

    await this.prisma.friend.createMany({
      data: [
        { userId: request.senderId, friendId: request.receiverId },
        { userId: request.receiverId, friendId: request.senderId },
      ],
    });

    return { success: true };
  }

  async rejectFriendRequest(requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== FriendRequestStatus.PENDING) {
      throw new NotFoundException('유효하지 않은 친구 요청입니다.');
    }

    return this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.REJECTED },
    });
  }

  async getFriends(userUuid: string) {
    const userId = await this.userService.getUserIdByUuid(userUuid);

    const friends = await this.prisma.friend.findMany({
      where: { userId },
      include: {
        friend: {
          select: { uuid: true, name: true },
        },
      },
    });

    return friends.map((f) => f.friend);
  }

  async getIncomingRequests(userUuid: string) {
    const userId = await this.userService.getUserIdByUuid(userUuid);

    return this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        sender: { select: { uuid: true, name: true } },
      },
    });
  }

  async getOutgoingRequests(userUuid: string) {
    const userId = await this.userService.getUserIdByUuid(userUuid);

    return this.prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        receiver: { select: { uuid: true, name: true } },
      },
    });
  }
}
