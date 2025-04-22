import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@WebSocketGateway()
export class StockGateway {
  constructor(private readonly stockService: StockService) {}

  @SubscribeMessage('createStock')
  create(@MessageBody() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @SubscribeMessage('findAllStock')
  findAll() {
    return this.stockService.findAll();
  }

  @SubscribeMessage('findOneStock')
  findOne(@MessageBody() id: number) {
    return this.stockService.findOne(id);
  }

  @SubscribeMessage('updateStock')
  update(@MessageBody() updateStockDto: UpdateStockDto) {
    return this.stockService.update(updateStockDto.id, updateStockDto);
  }

  @SubscribeMessage('removeStock')
  remove(@MessageBody() id: number) {
    return this.stockService.remove(id);
  }
}
