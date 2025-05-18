import {
  applyDecorators,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { RabbitMQInterceptor } from '../../interceptors/rabbitmq.interceptor';

export function RabbitmqSubscribe(routingKey: string) {
  const decorators = [];

  decorators.push(EventPattern());
  decorators.push(UseInterceptors(new RabbitMQInterceptor(routingKey)));
  
  return applyDecorators(...decorators);
}
