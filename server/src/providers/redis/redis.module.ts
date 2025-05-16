import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { LoggerModule } from 'src/config/logger/logger.module';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { Config } from '../../config/environment/config';
import { CLUSTER_NODES } from './constants/redis.constants';
import { SlackModule } from '../slack/slack.module';

@Module({
  imports: [
    IoRedisModule.forRootAsync({
      useFactory: () => {
        const redis = Config.getEnvironment().REDIS;

        if (redis.ENVIRONMENT === 'single') {
          return {
            type: 'single',
            url: `${redis.PROTOCOL}://${redis.HOST}:${redis.PORT}`,
          };
        }

        if (redis.ENVIRONMENT === 'cluster') {
          return {
            type: 'cluster',
            nodes: [
              {
                host: redis.HOST,
                port: redis.PORT,
              },
            ],
          };
        }
      },
    }),
    SlackModule,
    LoggerModule,
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
