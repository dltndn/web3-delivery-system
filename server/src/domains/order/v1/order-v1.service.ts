import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './repositories/mysql/order-v1.repository';
import { RabbitmqProduceService } from '../../../providers/rabbitmq/rabbitmq-produce.service';
import { PRODUCE_BIND } from '../../../providers/rabbitmq/constants/produce-bind.constants';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/providers/redis/redis.service';
import { ORDER_STATUS, ORDER_STATUS_MAP } from '../constants';
import { OrderCompleteRmqDto } from 'src/providers/rabbitmq/dtos/rabbitmq.dto';

@Injectable()
export class OrderV1Service {
  constructor(
    @InjectDataSource('connection1')
    private readonly connection1: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly redisService: RedisService,
    private readonly rabbitmqProducerService: RabbitmqProduceService,
  ) {}

  async getOrder(orderId: number) {
    try {
      return this.orderRepository.findOne(orderId);
    } catch (error) {
      throw new NotFoundException('오더를 찾을 수 없습니다.');
    }
  }

  async getOrderStatus(orderId: number) {
    try {
        // redis에서 오더 상태 조회
        const orderStatus = await this.redisService.getOrderStatus(orderId);
        if (!orderStatus) {
            // redis에 오더 상태가 없으면 데이터베이스에서 조회
            const order = await this.orderRepository.findOne(orderId);
            await this.redisService.saveOrderStatus(orderId, ORDER_STATUS_MAP[order.status]);
        }
        return orderStatus;
    } catch (error) {
        throw new NotFoundException('오더 상태를 찾을 수 없습니다.');
    }
  }

  // MQ로부터 메시지를 받아서 오더 완료 처리
  async processCompletedOrder(message: OrderCompleteRmqDto) {
    try {
        const { orderId } = message;

        // 오더 RDB 업데이트
        const order = await this.orderRepository.findOne(orderId);
        order.status = ORDER_STATUS.COMPLETED;
        await this.orderRepository.updateOne(orderId, order);
        
        console.log(`오더 ${orderId} 최종 완료 처리됨`);        
        return true;
    } catch (error) {
        console.error('오더 완료 처리 중 오류 발생:', error);
        throw error;
    }
  }
}
