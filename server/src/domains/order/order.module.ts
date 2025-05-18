import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './v1/entities/order-v1.entity';
import { OrderV1Service } from './v1/order-v1.service';
import { OrderV1Controller } from './v1/order-v1.controller';
import { RedisModule } from 'src/providers/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order], 'connection1'),
    forwardRef(() => RedisModule),
  ],
  controllers: [OrderV1Controller],
  providers: [OrderV1Service],
  exports: [OrderV1Service],
})
export class OrderModule {}
