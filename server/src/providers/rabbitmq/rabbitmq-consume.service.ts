import { Injectable } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { QUEUE } from './constants/queue.constants';

@Injectable()
export class RabbitmqConsumeService {
  constructor() {}
  async assertQueue() {
    const queueList = Object.values(QUEUE);
    for (const queue of queueList) {
      await RabbitmqService.channel.assertQueue(queue, { durable: false });
    }
  }
}
