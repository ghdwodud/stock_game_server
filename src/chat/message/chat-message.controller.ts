import { Controller, Get, Param } from '@nestjs/common';
import { ChatMessageService } from './chat-message.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('ChatMessage')
@Controller('chat/messages')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @Get(':roomId')
  @ApiOperation({ summary: '채팅방 메시지 가져오기' })
  async getMessages(@Param('roomId') roomId: string) {
    return this.chatMessageService.getMessagesByRoomId(roomId);
  }
}
