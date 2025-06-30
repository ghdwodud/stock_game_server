export class CreateRoomDto {
  name?: string;
  memberUuids: string[]; // 참여할 유저 UUID 목록
}
