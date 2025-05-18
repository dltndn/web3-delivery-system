import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Query,
  } from '@nestjs/common';
import { OrderV1Service } from './order-v1.service';
import { OrdersReqParamsDto } from './dtos/order-v1-req.dto';
import { CatchErrors } from 'src/core/decorator/catch-errors.decorator';
import { RabbitmqSubscribe } from 'src/core/decorator/rabbitmq.decorator';
import { PRODUCE_BIND } from 'src/providers/rabbitmq/constants/produce-bind.constants';
import { OrderCompleteRmqDto } from 'src/providers/rabbitmq/dtos/rabbitmq.dto';

@Controller('v1/orders')
export class OrderV1Controller {
    constructor(private readonly orderV1Service: OrderV1Service) {}

    @Get(':orderId')
    @CatchErrors()
    async getOrder(@Param() params: OrdersReqParamsDto) {
        return this.orderV1Service.getOrder(params.orderId);
    }

    @Get(':orderId/status')
    @CatchErrors()
    async getOrderStatus(@Param() params: OrdersReqParamsDto) {
        return this.orderV1Service.getOrderStatus(params.orderId);
    }

    // 오더 완료 처리 메시지 수신
    @RabbitmqSubscribe(PRODUCE_BIND.ORDER_COMPLETE.routingKey)
    async processCompletedOrder(message: OrderCompleteRmqDto) {
        return this.orderV1Service.processCompletedOrder(message);
    }
}
