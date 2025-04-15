import { Injectable } from '@nestjs/common';

@Injectable()
export class DashBoardService {
  getHello(): string {
    return 'Hello World!';
  }
}
