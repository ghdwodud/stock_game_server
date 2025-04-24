// src/firebase/firebase.module.ts
import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // ✅ 다른 모듈에서 사용 가능하도록 export
})
export class FirebaseModule {}
