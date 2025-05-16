import { Type, plainToClass } from 'class-transformer';
import { IsIn, IsNumber, IsString, ValidateNested } from 'class-validator';
import { DatabaseConfig } from './configs/database.config';
import { RedisConfig } from './configs/redis.config';
import { SwaggerConfig } from './configs/swagger.config';

export class Environment {
  @IsIn(['production', 'test', 'development'])
  NODE_ENV = process.env.NODE_ENV as 'production' | 'test' | 'development';

  @IsString()
  SERVICE_NAME = process.env.SERVICE_NAME;

  @IsString()
  SERVICE_VERSION = process.env.SERVICE_VERSION;

  @Type(() => Number)
  @IsNumber()
  SERVER_PORT = process.env?.SERVER_PORT ? Number(process.env.SERVER_PORT) : 12195;

  @ValidateNested()
  @Type(() => SwaggerConfig)
  swagger: SwaggerConfig = plainToClass(SwaggerConfig, {
    user: process.env.SWAGGER_USER,
    password: process.env.SWAGGER_PASSWORD,
  });

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

}
