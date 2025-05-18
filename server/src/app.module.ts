import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MysqlModule } from './providers/mysql/mysql.module';
import { EthersModule } from './providers/ethers/ethers.module';
import { RedisModule } from './providers/redis/redis.module';
import { RabbitmqModule } from './providers/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    EthersModule,
    MysqlModule,
    RedisModule,
    RabbitmqModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 