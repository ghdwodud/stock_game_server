import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService {
  buyStock(body: any) {
    // TODO: 실제 로직 구현
    console.log('매수 요청:', body);
    return { success: true, message: '매수 완료' };
  }

  sellStock(body: any) {
    // TODO: 실제 로직 구현
    console.log('매도 요청:', body);
    return { success: true, message: '매도 완료' };
  }
}
