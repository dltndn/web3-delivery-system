import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './config/environment/config';
import { QUEUE } from './providers/rabbitmq/constants/queue.constants';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 라우터 접두사 적용
  app.setGlobalPrefix('api/delivery/');

  // rabbitmq 설정
  const RABBITMQ = Config.getEnvironment().RABBITMQ;
  const QueueList = Object.values(QUEUE);
  for (const queue of QueueList) {
    if (queue === '') {
      continue;
    }

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [
          `${RABBITMQ.PROTOCOL}://${RABBITMQ.ID}:${encodeURIComponent(RABBITMQ.PASSWORD)}@${encodeURIComponent(RABBITMQ.HOST)}:${RABBITMQ.PORT}`,
        ],
        queue,
        queueOptions: {
          durable: false,
        },
        noAck: false,
      },
    });
  }
  await app.startAllMicroservices();

  await app.listen(Config.getEnvironment().SERVER_PORT);
  console.log(`Server is running on port ${Config.getEnvironment().SERVER_PORT}`);

  const exitHandler = () => {
    console.log('Server closed');
    process.exit(1);
  };

  process.on('SIGINT', exitHandler);
}
bootstrap();
