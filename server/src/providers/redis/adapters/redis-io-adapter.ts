import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { INestApplication, Logger } from '@nestjs/common';
import { RedisService } from '../redis.service';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private logger = new Logger(RedisIoAdapter.name);

  constructor(
    app: INestApplication,
    private readonly redisService: RedisService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = this.redisService.getClient();
      const subClient = pubClient.duplicate();

      pubClient.on('error', (err) =>
        this.logger.error('Redis PubClient Error', err),
      );
      subClient.on('error', (err) =>
        this.logger.error('Redis SubClient Error', err),
      );

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('Redis adapter connected successfully');
    } catch (e) {
      this.logger.error('Error connecting to Redis', e);
      process.exit(1);
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
