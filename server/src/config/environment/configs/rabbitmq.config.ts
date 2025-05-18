import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class RabbitMQConfig {
  @IsString()
  PROTOCOL: string;
  @IsString()
  HOST: string;
  @IsString()
  ID: string;
  @IsString()
  PASSWORD: string;
  @IsString()
  ENVIRONMENT: string;
  @Type(() => Number)
  @IsNumber()
  PORT: number;
}
