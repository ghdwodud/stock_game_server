// src/chat/chat.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatMessageService } from './message/chat-message.service';

@Module({
  imports: [PrismaModule],
  providers: [ChatGateway, ChatMessageService],
})
export class ChatModule {}
