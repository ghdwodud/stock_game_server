// src/chat/room/dto/create-room.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  name?: string;

  @IsArray()
  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  memberUuids: string[];
}
