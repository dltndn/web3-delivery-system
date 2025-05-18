import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './v1/entities/order-v1.entity';
import { OrderV1Service } from './v1/order-v1.service';
import { OrderV1Controller } from './v1/order-v1.controller';
import { RedisModule } from '../../providers/redis/redis.module';
import { RabbitmqModule } from '../../providers/rabbitmq/rabbitmq.module';
import { OrderRepository } from './v1/repositories/mysql/order-v1.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order], 'connection1'),
    forwardRef(() => RedisModule),
    forwardRef(() => RabbitmqModule),
  ],
  controllers: [OrderV1Controller],
  providers: [OrderV1Service, OrderRepository],
  exports: [OrderV1Service],
})
export class OrderModule {}
