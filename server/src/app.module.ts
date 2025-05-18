import { Module } from '@nestjs/common';
import { MysqlModule } from './providers/mysql/mysql.module';
import { EthersModule } from './providers/ethers/ethers.module';
import { RedisModule } from './providers/redis/redis.module';
import { RabbitmqModule } from './providers/rabbitmq/rabbitmq.module';
import { OrderModule } from './domains/order/order.module';
import { PollingModule } from './domains/polling/polling.module';

@Module({
  imports: [
    EthersModule,
    MysqlModule,
    RedisModule,
    RabbitmqModule,
    OrderModule,
    PollingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 