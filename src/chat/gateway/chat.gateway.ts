import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatMessageService } from '../message/chat-message.service';
import { SendMessageDto } from '../message/dto/send-message.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatMessageService) {}

  handleConnection(socket: Socket) {
    console.log(`✅ ${socket.id} connected`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`❌ ${socket.id} disconnected`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const saved = await this.chatService.saveMessage(data);

    // 1. 해당 roomId의 멤버 목록 조회
    const members = await this.chatService.getRoomMemberSocketIds(data.roomId);

    // 2. 각 멤버의 socketId로 메시지 전송
    for (const socketId of members) {
      socket.to(socketId).emit('receive_message', saved);
    }

    // 3. 보낸 사람에게도 다시 emit (자기 메시지 띄우기)
    socket.emit('receive_message', saved);
  }
}
