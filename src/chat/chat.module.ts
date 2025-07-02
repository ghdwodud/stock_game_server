// src/chat/chat.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatMessageService } from './message/chat-message.service';
import { ChatRoomService } from './room/chat-room.service';
import { ChatRoomController } from './room/chat-room.controller';
import { UserModule } from 'src/user/user.module';
import { ChatMessageController } from './message/chat-message.controller';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [ChatGateway, ChatMessageService, ChatRoomService],
  controllers: [ChatRoomController, ChatMessageController],
})
export class ChatModule {}
