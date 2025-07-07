import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatMessageService } from '../message/chat-message.service';
import { SendMessageDto } from '../message/dto/send-message.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatMessageService) {}

  @WebSocketServer()
  server: Server;

  // ✅ 소켓 연결 시 userId(uuid)를 이용한 개인 room 참가
  handleConnection(socket: Socket) {
    const userId = socket.handshake.query['userId'];
    if (typeof userId === 'string') {
      socket.join(userId); // userId 기반 개인 방 join
      console.log(`✅ ${socket.id} connected and joined uuid room ${userId}`);
    } else {
      console.log(`⚠️ ${socket.id} connected without userId`);
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`❌ ${socket.id} disconnected`);
  }

  // ✅ 클라이언트가 채팅방 입장
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
    console.log(`📤 message sent to room ${data.roomId}`);
  }

  // ✅ 채팅방 생성 후 상대방에게 알림 (해당 유저 전용 room으로 전송)
  @SubscribeMessage('notify_new_room')
  handleNotifyNewRoom(
    @MessageBody() data: { targetUuid: string; roomId: string },
  ) {
    this.server.to(data.targetUuid).emit('new_room', {
      roomId: data.roomId,
    });
    console.log(`📨 new_room sent to ${data.targetUuid}`);
  }

  // ✅ 채팅방 삭제 후 알림
  @SubscribeMessage('notify_delete_room')
  handleNotifyDeleteRoom(
    @MessageBody() data: { targetUuid: string; roomId: string },
  ) {
    this.server.to(data.targetUuid).emit('room_deleted', {
      roomId: data.roomId,
    });
    console.log(`🗑️ room_deleted sent to ${data.targetUuid}`);
  }
}
