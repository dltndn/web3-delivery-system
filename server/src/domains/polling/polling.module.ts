import { Module, forwardRef } from '@nestjs/common';
import { PollingV1Service } from './v1/polling-v1.service';
import { PollingV1Controller } from './v1/polling-v1.controller';
import { RedisModule } from '../../providers/redis/redis.module';
import { RabbitmqModule } from '../../providers/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    forwardRef(() => RedisModule),
    forwardRef(() => RabbitmqModule),
  ],
  controllers: [PollingV1Controller],
  providers: [PollingV1Service],
  exports: [PollingV1Service],
})
export class PollingModule {}
