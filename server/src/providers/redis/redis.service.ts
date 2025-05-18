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

  /**
   * orderId를 키로 사용하여 status 값을 저장합니다.
   * @param orderId 오더 ID
   * @param status 저장할 상태 값
   * @param expireTime 만료 시간(초), 기본값은 1시간
   * @returns 저장 성공 시 'OK'
   */
  async saveOrderStatus(orderId: string | number, status: string, expireTime: number = 3600): Promise<'OK'> {
    const key = `order:${orderId}:status`;
    await this.redis.set(key, status);
    await this.redis.expire(key, expireTime);
    return 'OK';
  }

  /**
   * orderId로 저장된 status 값을 조회합니다.
   * @param orderId 오더 ID
   * @returns 저장된 status 값, 없으면 null
   */
  async getOrderStatus(orderId: string | number): Promise<string | null> {
    const key = `order:${orderId}:status`;
    return await this.redis.get(key);
  }
}
