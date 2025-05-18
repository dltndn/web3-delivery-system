import { EXCHANGE } from './exchange.constants';
import { ROUTING_KEY } from './routing-key.constants';

export const PRODUCE_BIND = {
  ORDER_COMPLETE: {
    exchange: EXCHANGE.ORDER_DIRECT_EXCHANGE,
    routingKey: ROUTING_KEY.ORDER_COMPLETE.name,
  },
};
