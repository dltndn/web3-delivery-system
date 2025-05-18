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

    async pollContractEvents(contractAddress: string, body: any) {
        try {
            // 컨트랙트 이벤트 파싱 후 데이터 추출
            const orderInfo = {
                orderId: 1,
                orderStatus: ORDER_STATUS.COMPLETED,
            }

            // 오더가 파싱된 경우 오더 처리
            if (orderInfo) {
                // 오더 완료 처리
                if (orderInfo.orderStatus === ORDER_STATUS.COMPLETED) {
                    await this.processOrderCompleted(orderInfo);
                }
                // 오더 취소 처리
                if (orderInfo.orderStatus === ORDER_STATUS.CANCELLED) {
                    // await this.processOrderCancelled(orderInfo);
                }
                // ...
            }
            return true;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('컨트랙트 이벤트 파싱 중 오류가 발생했습니다.');
        }
    }

    async processOrderCompleted(orderInfo: any) {
        try {
            // 오더 상태 업데이트
            await this.redisService.saveOrderStatus(orderInfo.orderId, ORDER_STATUS_MAP[orderInfo.orderStatus]);
            // 오더 완료 메시지 전송
            await this.rabbitmqProducerService.sendMessage(PRODUCE_BIND.ORDER_COMPLETE, { orderId: orderInfo.orderId });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('오더 상태를 업데이트하는데 실패했습니다.');
        }
    }
}
