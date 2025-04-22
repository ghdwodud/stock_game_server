import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StockHistoryService } from './stock-history.service';
import { CreateStockHistoryDto } from './dto/create-stock-history.dto';
import { UpdateStockHistoryDto } from './dto/update-stock-history.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('StockHistory') // Swagger에서 그룹 이름 지정
@Controller('stock-history')
export class StockHistoryController {
  constructor(private readonly stockHistoryService: StockHistoryService) {}

  @Post()
  @ApiOperation({ summary: '가격 히스토리 생성' })
  @ApiBody({ type: CreateStockHistoryDto })
  @ApiResponse({ status: 201, description: '히스토리 생성 완료' })
  create(@Body() createStockHistoryDto: CreateStockHistoryDto) {
    return this.stockHistoryService.create(createStockHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 히스토리 조회' })
  findAll() {
    return this.stockHistoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '히스토리 단건 조회' })
  @ApiParam({ name: 'id', description: '히스토리 ID' })
  findOne(@Param('id') id: string) {
    return this.stockHistoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '히스토리 수정' })
  @ApiParam({ name: 'id', description: '히스토리 ID' })
  @ApiBody({ type: UpdateStockHistoryDto })
  update(
    @Param('id') id: string,
    @Body() updateStockHistoryDto: UpdateStockHistoryDto,
  ) {
    return this.stockHistoryService.update(+id, updateStockHistoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '히스토리 삭제' })
  @ApiParam({ name: 'id', description: '히스토리 ID' })
  remove(@Param('id') id: string) {
    return this.stockHistoryService.remove(+id);
  }

  @Get('stock/:stockId/history')
  @ApiOperation({ summary: '특정 주식의 가격 히스토리 조회' })
  @ApiParam({ name: 'stockId', description: '주식 ID' })
  @ApiResponse({
    status: 200,
    description: '해당 주식의 최근 가격 리스트',
    schema: {
      type: 'array',
      items: { type: 'number', example: 1050.2 },
    },
  })
  async getHistoryByStockId(@Param('stockId') stockId: string) {
    const parsedId = parseInt(stockId, 10);
    const history = await this.stockHistoryService.findByStockId(parsedId);
    return history.map((h) => h.price);
  }
}
