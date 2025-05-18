import { Injectable } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { EXCHANGE } from './constants/exchange.constants';
import { ROUTING_KEY } from './constants/routing-key.constants';
import { PRODUCE_BIND } from './constants/produce-bind.constants';

export type RoutingKeyToType<
  T extends (typeof PRODUCE_BIND)[keyof typeof PRODUCE_BIND],
> = {
  [K in keyof typeof ROUTING_KEY]: (typeof ROUTING_KEY)[K]['name'] extends T['routingKey']
    ? InstanceType<(typeof ROUTING_KEY)[K]['type']>
    : never;
}[keyof typeof ROUTING_KEY];

@Injectable()
export class RabbitmqProduceService {
  constructor(private readonly logger: any) {}

  async assertExchange() {
    // produce
    const EXCHANGE_LIST = Object.values(EXCHANGE);
    for (const exchange of EXCHANGE_LIST) {
      await RabbitmqService.channel.assertExchange(
        exchange.name,
        exchange.type,
        {
          durable: false,
        },
      );
    }
  }

  async sendMessage<T extends (typeof PRODUCE_BIND)[keyof typeof PRODUCE_BIND]>(
    produceBind: T,
    data: RoutingKeyToType<T>,
  ) {
    try {
      const messageBuffer = Buffer.from(
        JSON.stringify({
          data,
        }),
      );
      const exchange = produceBind.exchange.name;
      const routingKey = produceBind.routingKey;

      RabbitmqService.channel.publish(exchange, routingKey, messageBuffer);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
