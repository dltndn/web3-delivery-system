import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsString } from 'class-validator';

export class DatabaseConfig {
  @IsIn(['mysql', 'postgres'])
  type: 'mysql' | 'postgres';

  @IsString()
  host: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  database: string;

  @Type(() => Number)
  @IsNumber()
  port: number;
}
