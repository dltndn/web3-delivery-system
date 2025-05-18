import { Injectable } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { QUEUE } from './constants/queue.constants';

@Injectable()
export class RabbitmqConsumeService {
  constructor(private readonly rabbitmqService: RabbitmqService) {}
  
  async assertQueue() {
    const queueList = Object.values(QUEUE);
    for (const queue of queueList) {
      await RabbitmqService.channel.assertQueue(queue, { durable: false });
    }
  }

  async consumeCompleteOrderQueue(callback: (msg: any) => void) {
    try {
      await RabbitmqService.channel.consume(
        QUEUE.COMPLETE_ORDER_QUEUE,
        (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            RabbitmqService.channel.ack(msg);
          }
        },
        { noAck: false }
      );
    } catch (error) {
      console.error('Error consuming from COMPLETE_ORDER_QUEUE:', error);
      throw error;
    }
  }
}
