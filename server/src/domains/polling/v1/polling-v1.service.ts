import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RabbitmqProduceService } from '../../../providers/rabbitmq/rabbitmq-produce.service';
import { PRODUCE_BIND } from '../../../providers/rabbitmq/constants/produce-bind.constants';
import { RedisService } from 'src/providers/redis/redis.service';
import { ORDER_STATUS, ORDER_STATUS_MAP } from 'src/domains/order/constants';

@Injectable()
export class PollingV1Service {
    constructor(
        private readonly redisService: RedisService,
        private readonly rabbitmqProducerService: RabbitmqProduceService,
    ) {}

    async pollOrderCompleted(orderId: number) {
        try {
            // 오더 상태 업데이트
            await this.redisService.saveOrderStatus(orderId, ORDER_STATUS_MAP[ORDER_STATUS.COMPLETED]);
            // 오더 완료 메시지 전송
            await this.rabbitmqProducerService.sendMessage(PRODUCE_BIND.ORDER_COMPLETE, { orderId });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('오더 상태를 조회하는데 실패했습니다.');
        }
    }
}
