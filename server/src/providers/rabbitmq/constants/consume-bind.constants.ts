import { EXCHANGE } from './exchange.constants';
import { QUEUE } from './queue.constants';
import { ROUTING_KEY } from './routing-key.constants';
export const CONSUME_BIND = [
  {
    queue: QUEUE.COMPLETE_ORDER_QUEUE,
    exchange: EXCHANGE.COMPLETE_ORDER_DIRECT_EXCHANGE.name,
    routingKey: {
      name: ROUTING_KEY.ORDER_COMPLETE.name,
      version: ROUTING_KEY.ORDER_COMPLETE.version,
    },
  },
  {
    queue: QUEUE.COMPLETE_ORDER_NOTI_QUEUE,
    exchange: EXCHANGE.COMPLETE_ORDER_DIRECT_EXCHANGE.name,
    routingKey: {
      name: ROUTING_KEY.ORDER_COMPLETE.name,
      version: ROUTING_KEY.ORDER_COMPLETE.version,
    },
  },
  {
    queue: QUEUE.COMPLETE_ORDER_LOG_QUEUE,
    exchange: EXCHANGE.COMPLETE_ORDER_DIRECT_EXCHANGE.name,
    routingKey: {
      name: ROUTING_KEY.ORDER_COMPLETE.name,
      version: ROUTING_KEY.ORDER_COMPLETE.version,
    },
  },
];
