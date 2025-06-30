import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('chat/rooms')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.chatRoomService.createRoom(dto);
  }

  @Get()
  async getMyChatRooms(@Query('userUuid') userUuid: string) {
    return this.chatRoomService.getRoomsByUserUuid(userUuid);
  }
}
