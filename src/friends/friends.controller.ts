// src/friends/friends.controller.ts
import {
  Controller,
  Post,
  Param,
  UseGuards,
  Get,
  Req,
  Delete,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('friends')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request/:id/accept')
  async acceptRequest(@Param('id') requestId: string) {
    return this.friendsService.acceptFriendRequest(requestId);
  }

  @Post('request/:id/reject')
  async rejectRequest(@Param('id') requestId: string) {
    return this.friendsService.rejectFriendRequest(requestId); // ✅ 수정
  }

  @Post('request/:uuid')
  sendRequest(
    @Param('uuid') receiverUuid: string,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.sendFriendRequest(req.user.uuid, receiverUuid);
  }

  @Get()
  async getFriends(@Req() req: RequestWithUser) {
    return this.friendsService.getFriends(req.user.uuid);
  }

  @Get('requests/incoming')
  async getIncomingRequests(@Req() req: RequestWithUser) {
    return this.friendsService.getIncomingRequests(req.user.uuid);
  }

  @Get('requests/outgoing')
  async getOutgoingRequests(@Req() req: RequestWithUser) {
    return this.friendsService.getOutgoingRequests(req.user.uuid);
  }

  @Delete(':uuid')
  async deleteFriend(
    @Param('uuid') friendUuid: string,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.deleteFriend(req.user.uuid, friendUuid);
  }
}
