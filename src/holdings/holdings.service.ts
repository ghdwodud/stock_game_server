import { Injectable } from '@nestjs/common';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';

@Injectable()
export class HoldingsService {
  create(createHoldingDto: CreateHoldingDto) {
    return 'This action adds a new holding';
  }

  findAll() {
    return `This action returns all holdings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} holding`;
  }

  update(id: number, updateHoldingDto: UpdateHoldingDto) {
    return `This action updates a #${id} holding`;
  }

  remove(id: number) {
    return `This action removes a #${id} holding`;
  }
}
