import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Environment } from './environment';
import { config as dotenvConfig } from 'dotenv';
import { Logger } from '@nestjs/common';

export class Config {
  private static instance: Environment;
  private static readonly logger = new Logger();
  private constructor() {}

  public static getEnvironment(): Environment {
    if (!Config.instance) {
      const envFilePath = '.env';
      dotenvConfig({ path: envFilePath });
      Config.instance = Config.validate(process.env);
      Config.instance = Object.freeze(Config.instance);
    }
    return Config.instance;
  }

  public static validate(config: Record<string, unknown>): Environment {
    const validatedConfig = plainToInstance(Environment, config, {
      // true로 설정할 경우 암시적 타입변환을 허용합니다.
      enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
      // true로 설정할 경우 undefined, null값을 가진 개체는 유효성 검사를 건너뜁니다.
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      this.logger.error(
        'Server Initialize ENV Validation Error: Server Closed',
      );
      errors.forEach((error) => {
        if (error.children.length) {
          error.children.forEach((childError) => {
            Object.values(childError.constraints).forEach((constraint) => {
              this.logger.error(constraint);
            });
          });
        } else {
          Object.values(error.constraints).forEach((constraint) => {
            this.logger.error(constraint);
          });
        }
      });
      process.exit(1);
    }

    return validatedConfig;
  }
}
