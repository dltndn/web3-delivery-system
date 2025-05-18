import { Type, plainToClass } from 'class-transformer';
import { IsIn, IsNumber, IsString, ValidateNested } from 'class-validator';
import { DatabaseConfig } from './configs/database.config';
import { RedisConfig } from './configs/redis.config';
import { RabbitMQConfig } from './configs/rabbitmq.config';

export class Environment {
  @IsIn(['production', 'test', 'development'])
  NODE_ENV = process.env.NODE_ENV as 'production' | 'test' | 'development';

  @IsString()
  SERVICE_NAME = process.env.SERVICE_NAME;

  @IsString()
  SERVICE_VERSION = process.env.SERVICE_VERSION;

  @IsString()
  SERVER_ENVIRONMENT_ID = process.env.SERVER_ENVIRONMENT_ID || 'dev';

  @Type(() => Number)
  @IsNumber()
  SERVER_PORT = process.env?.SERVER_PORT ? Number(process.env.SERVER_PORT) : 12195;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  DB_1: DatabaseConfig = plainToClass(DatabaseConfig, {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
  });

  @ValidateNested()
  @Type(() => RedisConfig)
  REDIS: RedisConfig = plainToClass(RedisConfig, {
    HOST: process.env.REDIS_HOST,
    ENVIRONMENT: process.env.REDIS_ENVIRONMENT,
    PORT: Number(process.env.REDIS_PORT),
    PROTOCOL: process.env.REDIS_PROTOCOL,
  });

  @ValidateNested()
  @Type(() => RabbitMQConfig)
  RABBITMQ: RabbitMQConfig = plainToClass(RabbitMQConfig, {
    PROTOCOL: process.env.RABBIT_MQ_PROTOCOL,
    HOST: process.env.RABBIT_MQ_HOST,
    ID: process.env.RABBIT_MQ_ID,
    PASSWORD: process.env.RABBIT_MQ_PASSWORD,
    ENVIRONMENT: process.env.RABBIT_MQ_ENVIRONMENT,
    PORT: Number(process.env.RABBIT_MQ_PORT),
  });
}
