import { Injectable, OnModuleInit } from '@nestjs/common';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { Cluster, Redis } from 'ioredis';
import { Logger } from '../../config/logger/logger.service';
import { SlackService } from '../slack/slack.service';
import { Config } from 'src/config/environment/config';

const slackWebHookUrl = Config.getEnvironment().slack.webHookUrl;

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(
    private readonly logger: Logger,
    @InjectRedis() private readonly redis: Redis | Cluster,
    private readonly slackService: SlackService,
  ) {}

  async onModuleInit() {
    await this.initializeRedis();
  }

  async initializeRedis() {
    this.redis.on('error', (err) => {
      this.redisErrorHandler(err);
    });
    this.logger.log('Redis Connected');
  }

  private redisErrorHandler(err) {
    this.logger.error('Redis Client Error', err),
      this.slackService.sendMessage(slackWebHookUrl, {
        text: 'Redis Client Error',
        username: 'aws Slack Alert Bot',
        icon_emoji: ':ghost:',
        channel: '#sample2',
      });
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
