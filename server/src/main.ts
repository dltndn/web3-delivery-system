import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './config/environment/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 라우터 접두사 적용
  app.setGlobalPrefix('api/delivery/');

  await app.listen(Config.getEnvironment().SERVER_PORT);
  console.log(`Server is running on port ${Config.getEnvironment().SERVER_PORT}`);

  const exitHandler = () => {
    console.log('Server closed');
    process.exit(1);
  };

  process.on('SIGINT', exitHandler);
}
bootstrap();
