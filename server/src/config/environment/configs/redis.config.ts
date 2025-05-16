import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class RedisConfig {
  @IsString()
  HOST: string;
  @IsString()
  ENVIRONMENT: string;
  @Type(() => Number)
  @IsNumber()
  PORT: number;

  @IsString()
  PROTOCOL: string;
}
