import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatMessageService } from '../message/chat-message.service';
import { SendMessageDto } from '../message/dto/send-message.dto';
import { WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatMessageService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`✅ ${socket.id} connected`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`❌ ${socket.id} disconnected`);
  }

  // ✅ 클라이언트가 방 참가 요청 시
  @SubscribeMessage('join')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(data.roomId);
    console.log(`📥 ${socket.id} joined room ${data.roomId}`);
  }

  // ✅ 메시지 전송 → 해당 room 전체에 broadcast
  @SubscribeMessage('send_message')
  async handleSendMessage(@MessageBody() data: SendMessageDto) {
    const saved = await this.chatService.saveMessage(data);
    this.server.to(data.roomId).emit('receive_message', saved);
  }
}
