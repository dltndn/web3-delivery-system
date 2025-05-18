import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { waitForSeconds } from '../../utils/wait';
import { RabbitmqConsumeService } from './rabbitmq-consume.service';
import { RabbitmqProduceService } from './rabbitmq-produce.service';
import { Config } from '../../config/environment/config';
import { RabbitMQDocumentationService } from './rabbitmq-documentation.service';
import { RabbitmqBinderService } from './rabbitmq-binder.service';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection: amqp.Connection;
  static channel: amqp.Channel;

  constructor(
    private readonly rabbitmqConsumerService: RabbitmqConsumeService,
    @Inject(forwardRef(() => RabbitmqProduceService))
    private readonly rabbitmqProducerService: RabbitmqProduceService,
    private readonly rabbitmqBinderService: RabbitmqBinderService,
    private readonly rabbitmqDocumentationService: RabbitMQDocumentationService,
  ) {}

  async onModuleInit() {
    await this.connectChannel();

    // producer
    await this.rabbitmqProducerService.assertExchange();

    // consumer
    await this.rabbitmqConsumerService.assertQueue();
    await this.rabbitmqBinderService.bindQueue();

    // documentation
    // this.rabbitmqDocumentationService.generateDocumentation();
  }

  async connectChannel() {
    const RABBITMQ = Config.getEnvironment().RABBITMQ;

    this.connection = await amqp.connect(
      `${RABBITMQ.PROTOCOL}://${RABBITMQ.ID}:${encodeURIComponent(RABBITMQ.PASSWORD)}@${encodeURIComponent(RABBITMQ.HOST)}:${RABBITMQ.PORT}`,
    );
    this.connection.on('close', () => {
      console.error('RabbitMQ connection is closed');
      this.healthCheck();
    });

    RabbitmqService.channel = await this.connection.createChannel();

    return RabbitmqService.channel;
  }

  async healthCheck(): Promise<void> {
    while (true) {
      try {
        const RABBITMQ = Config.getEnvironment().RABBITMQ;
        await waitForSeconds(1);

        let connection: amqp.Connection;

        if (RABBITMQ.ENVIRONMENT === 'local') {
          connection = await amqp.connect(
            `${RABBITMQ.PROTOCOL}://${RABBITMQ.ID}:${RABBITMQ.PASSWORD}@${RABBITMQ.HOST}:${RABBITMQ.PORT}`,
          );
        } else if (RABBITMQ.ENVIRONMENT === 'aws') {
          connection = await amqp.connect(
            `${RABBITMQ.PROTOCOL}://${RABBITMQ.ID}:${encodeURIComponent(RABBITMQ.PASSWORD)}@${encodeURIComponent(RABBITMQ.HOST)}:${RABBITMQ.PORT}`,
          );
        }

        const channel = await connection.createChannel();

        console.log('RabbitMQ connection is reconnected');
        await channel.close();
        await connection.close();

        await this.connectChannel();
        break;
      } catch (e) {}
    }
  }
}
