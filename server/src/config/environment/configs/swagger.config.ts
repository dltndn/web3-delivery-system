import { IsString } from 'class-validator';

export class SwaggerConfig {
  @IsString()
  user: string;

  @IsString()
  password: string;
}
