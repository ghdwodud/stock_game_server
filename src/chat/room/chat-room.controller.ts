import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Chatroom')
@Controller('chatroom')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  @ApiOperation({ summary: '채팅방 생성' })
  @ApiBody({ type: CreateRoomDto })
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.chatRoomService.createRoom(dto);
  }

  @Get()
  @ApiOperation({ summary: '내 채팅방 목록 가져오기' })
  @ApiQuery({ name: 'userUuid', type: String })
  async getMyChatRooms(@Query('userUuid') userUuid: string) {
    return this.chatRoomService.getRoomsByUserUuid(userUuid);
  }

  @Delete(':roomId')
  @ApiOperation({ summary: '채팅방 삭제' })
  @ApiQuery({ name: 'userUuid', type: String })
  async deleteRoom(
    @Param('roomId') roomId: string,
    @Query('userUuid') userUuid: string,
  ) {
    return this.chatRoomService.deleteRoom(roomId, userUuid);
  }
}
