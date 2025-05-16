import { Config } from '../../../config/environment/config';

const REDIS = Config.getEnvironment().REDIS;
export const CLUSTER_NODES = [
  {
    host: REDIS.HOST,
    port: 7001,
  },
  {
    host: REDIS.HOST,
    port: 7002,
  },
  {
    host: REDIS.HOST,
    port: 7003,
  },
  {
    host: REDIS.HOST,
    port: 7004,
  },
  {
    host: REDIS.HOST,
    port: 7005,
  },
  {
    host: REDIS.HOST,
    port: 7006,
  },
];
