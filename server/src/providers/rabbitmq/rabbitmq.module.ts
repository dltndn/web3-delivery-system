import { Module } from '@nestjs/common';

import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqProduceService } from './rabbitmq-produce.service';
import { RabbitmqConsumeService } from './rabbitmq-consume.service';
import { RabbitMQDocumentationService } from './rabbitmq-documentation.service';
import { RabbitmqBinderService } from './rabbitmq-binder.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    RabbitmqService,
    RabbitmqBinderService,
    RabbitmqProduceService,
    RabbitmqConsumeService,
    RabbitMQDocumentationService,
  ],
  exports: [
    RabbitmqService,
    RabbitmqProduceService,
    RabbitmqConsumeService,
    RabbitmqBinderService,
  ],
})
export class RabbitmqModule {}
