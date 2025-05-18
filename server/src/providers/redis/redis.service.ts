import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Cluster, Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(
    @InjectRedis() private readonly redis: Redis | Cluster,
  ) {}

  async onModuleInit() {
    await this.initializeRedis();
  }

  async initializeRedis() {
    this.redis.on('error', (err) => {
      this.redisErrorHandler(err);
    });
    console.log('Redis Connected');
  }

  private redisErrorHandler(err) {
    console.error('Redis Client Error', err);
  }

  getClient(): Redis | Cluster {
    return this.redis;
  }

  async getMasterNodes() {
    const result = [];
    if (this.redis instanceof Cluster) {
      this.redis.nodes('master').map((node) => {
        result.push({
          host: node.options.host,
          port: node.options.port,
        });
      });
    }
    return result;
  }
}
