// src/chat/chat.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatMessageService } from './message/chat-message.service';
import { ChatRoomService } from './room/chat-room.service';
import { ChatRoomController } from './room/chat-room.controller';

@Module({
  imports: [PrismaModule],
  providers: [ChatGateway, ChatMessageService, ChatRoomService],
  controllers: [ChatRoomController],
})
export class ChatModule {}
