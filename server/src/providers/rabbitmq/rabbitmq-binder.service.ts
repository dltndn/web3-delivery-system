import { Injectable } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { CONSUME_BIND } from './constants/consume-bind.constants';

@Injectable()
export class RabbitmqBinderService {
  constructor() {}
  async bindQueue() {
    CONSUME_BIND.map(async (bind) => {
      await RabbitmqService.channel.bindQueue(
        bind.queue,
        bind.exchange,
        bind.routingKey.name,
      );
    });
  }
}
