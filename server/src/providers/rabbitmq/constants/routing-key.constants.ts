import { OrderCompleteRmqDto } from '../dtos/rabbitmq.dto';

export const ROUTING_KEY = {
  ORDER_COMPLETE: {
    name: 'ORDER_COMPLETE_ROUTING_KEY',
    type: OrderCompleteRmqDto,
    version: '1.0.0',
  },
} as const;

/**
 * @description
 * DTO 정의위치
 * - Publish: src/providers/rabbitmq/dtos/rabbitmq.dto.ts
 * - Consume: src/providers/rabbitmq/dtos/{domain}-req-{version}.dto.ts
 */
